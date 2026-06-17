import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DemandeService } from '../../../core/services/demande.service';
import { AppareilService } from '../../../core/services/appareil.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-demande-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
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
    private route: ActivatedRoute,
    private translate: TranslateService
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
      Swal.fire(
        this.translate.instant('demandeForm.warningTitle'),
        this.translate.instant('demandeForm.fillSymptomsDate'),
        'warning'
      );
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
          Swal.fire(
            this.translate.instant('demandeForm.errorTitle'),
            this.translate.instant('demandeForm.backendNoResponse'),
            'error'
          );
          this.loading = false;
          return;
        }

        const raw = res.datePrevueRep;

        if (!raw) {
          Swal.fire(
            this.translate.instant('demandeForm.errorTitle'),
            this.translate.instant('demandeForm.invalidDateReceived'),
            'error'
          );
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
          title: this.translate.instant('demandeForm.datePredicted'),
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
          title: this.translate.instant('demandeForm.predictionUnavailable'),
          text: this.translate.instant('demandeForm.predictionUnavailableText')
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

      Swal.fire(
        this.translate.instant('demandeForm.invalidFormTitle'),
        this.translate.instant('demandeForm.fillRequiredFields'),
        'warning'
      );
      return;
    }

    // ⭐ FIX IMPORTANT
    if (!this.demande.datePrevueRep) {
      Swal.fire({
        icon: 'warning',
        title: this.translate.instant('demandeForm.missingExpectedDate'),
        text: this.translate.instant('demandeForm.missingExpectedDateText')
      });
      return;
    }

    if (new Date(this.demande.datePrevueRep) < new Date(this.demande.dateDepot)) {
      Swal.fire({
        icon: 'warning',
        title: this.translate.instant('demandeForm.inconsistentDates'),
        text: this.translate.instant('demandeForm.inconsistentDatesText')
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
          title: this.translate.instant('demandeForm.successTitle'),
          text: this.id
            ? this.translate.instant('demandeForm.demandeUpdated')
            : this.translate.instant('demandeForm.demandeAdded')
        });

        this.router.navigate(['/demandes']);
      },
      error: () => {
        this.loading = false;
        Swal.fire(
          this.translate.instant('demandeForm.errorTitle'),
          this.translate.instant('demandeForm.operationFailed'),
          'error'
        );
      }
    });
  }
}
