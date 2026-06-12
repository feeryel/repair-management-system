import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DemandeService } from '../../../core/services/demande.service';
import { AppareilService } from '../../../core/services/appareil.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-demande-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './demande-form.component.html',
  styleUrls: ['./demande-form.component.css']
})
export class DemandeFormComponent implements OnInit {

  demande: any = {
    dateDepot: '',
    datePrevueRep: '',
    symptomesPanne: '',
    etat: 'En attente',
    appareilId: null
  };

  appareils: any[] = [];

  id: any;
  loading = false;
  predicted = false;
  predictionFailed = false;

  constructor(
    private demandeService: DemandeService,
    private appareilService: AppareilService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.id = this.route.snapshot.paramMap.get('id');

    this.appareilService.getAll().subscribe({
      next: (res: any) => this.appareils = res ?? []
    });

    if (this.id) {
      this.loading = true;

      this.demandeService.getOne(this.id).subscribe({
        next: (res: any) => {
          this.demande = res;
          this.demande.appareilId = res?.AppareilId ?? res?.Appareil?.id ?? null;
          if (this.demande.dateDepot) this.demande.dateDepot = this.demande.dateDepot.substring(0, 10);
          if (this.demande.datePrevueRep) this.demande.datePrevueRep = this.demande.datePrevueRep.substring(0, 10);

          // ⭐ important fix
          this.predicted = !!res?.datePrevueRep;

          this.loading = false;
        },
        error: () => this.loading = false
      });
    }
  }

  appareilLabel(a: any): string {
    const client = a.Client?.nom ? `${a.Client.nom} — ` : '';
    return `${client}${a.marque ?? ''} ${a.modele ?? ''} (${a.numSerie ?? '—'})`;
  }

  predict() {

    console.log("🟡 CLICK predict()");
    console.log("symptomes =", this.demande.symptomesPanne);
    console.log("dateDepot =", this.demande.dateDepot);

    if (!this.demande.symptomesPanne || !this.demande.dateDepot) {
      Swal.fire('Warning', 'Remplir symptômes + date dépôt', 'warning');
      return;
    }

    this.loading = true;
    this.predicted = false;
    this.predictionFailed = false;

    this.demandeService.predictDate(
      this.demande.symptomesPanne,
      this.demande.dateDepot
    )
    .subscribe({

      next: (res: any) => {

        console.log("🟢 RESPONSE =", res);

        if (!res) {
          Swal.fire('Erreur', 'Backend ne répond pas', 'error');
          this.loading = false;
          return;
        }

        const raw = res.datePrevueRep;

        if (!raw) {
          Swal.fire('Erreur', 'Date invalide reçue', 'error');
          this.loading = false;
          return;
        }

        // clean date (important)
        const cleanDate = raw.replace('=', '').split('T')[0];

        console.log("🧼 CLEAN DATE =", cleanDate);

        this.demande.datePrevueRep = cleanDate;

        this.predicted = true;

        this.loading = false;

        Swal.fire({
          icon: 'success',
          title: 'Date prédite',
          text: cleanDate
        });
      },

      error: (err) => {
        console.log("🔴 ERROR =", err);
        this.loading = false;
        this.predicted = false;
        this.predictionFailed = true;

        Swal.fire({
          icon: 'warning',
          title: 'Prédiction indisponible',
          text: 'Le service de prédiction ne répond pas. Vous pouvez saisir la date prévue manuellement.'
        });
      }

    });
  }

  save(form: any) {

    if (form.invalid) {

      Object.keys(form.controls).forEach(k => {
        if (k !== 'datePrevueRep') {
          form.controls[k].markAsTouched();
        }
      });

      Swal.fire('Formulaire invalide', 'Remplir les champs obligatoires', 'warning');
      return;
    }

    // ⭐ FIX IMPORTANT
    if (!this.demande.datePrevueRep) {
      Swal.fire({
        icon: 'warning',
        title: 'Date prévue manquante',
        text: 'Cliquez sur "Prédire la date" ou saisissez une date prévue manuellement'
      });
      return;
    }

    if (new Date(this.demande.datePrevueRep) < new Date(this.demande.dateDepot)) {
      Swal.fire({
        icon: 'warning',
        title: 'Dates incohérentes',
        text: 'La date prévue ne peut pas être avant la date de dépôt'
      });
      return;
    }

    this.loading = true;

    const payload = {
      ...this.demande,
      appareilId: Number(this.demande.appareilId)
    };

    const req = this.id
      ? this.demandeService.update(this.id, payload)
      : this.demandeService.add(payload);

    req.subscribe({
      next: () => {
        this.loading = false;

        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: this.id ? 'Demande modifiée' : 'Demande ajoutée'
        });

        this.router.navigate(['/demandes']);
      },
      error: () => {
        this.loading = false;
        Swal.fire('Erreur', 'Operation échouée', 'error');
      }
    });
  }
}
