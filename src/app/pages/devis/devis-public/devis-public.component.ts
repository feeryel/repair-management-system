import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DevisService } from '../../../core/services/devis.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-devis-public',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devis-public.component.html',
  styleUrls: ['./devis-public.component.css']
})
export class DevisPublicComponent implements OnInit {

  devis: any;
  token = '';

  loading = true;
  error = '';
  responding = false;
  showMotifInput = false;
  motif = '';

  constructor(
    private route: ActivatedRoute,
    private devisService: DevisService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const token = params.get('token');

      if (!token) {
        this.loading = false;
        this.error = 'Lien de devis invalide.';
        return;
      }

      this.token = token;

      this.devisService.getPublicByToken(token).subscribe({
        next: (res: any) => {
          this.devis = res;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.error = 'Devis introuvable.';
        }
      });
    });
  }

  get reparation(): any {
    return this.devis?.Reparation;
  }

  get demande(): any {
    return this.reparation?.Demande ?? this.reparation?.DemandeReparation;
  }

  get appareil(): any {
    return this.demande?.Appareil;
  }

  get client(): any {
    return this.appareil?.Client;
  }

  get lignes(): any[] {
    return this.reparation?.LigneReparations ?? [];
  }

  toggleMotifInput(): void {
    this.showMotifInput = !this.showMotifInput;
  }

  accept(): void {
    Swal.fire({
      title: 'Accepter ce devis ?',
      text: 'La réparation pourra reprendre dès votre confirmation.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, accepter',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#10b981'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.respond('accept');
    });
  }

  reject(): void {
    Swal.fire({
      title: 'Refuser ce devis ?',
      text: 'Vous pouvez préciser le motif ci-dessous.',
      input: 'textarea',
      inputPlaceholder: 'Motif (optionnel)',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer le refus',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc2626'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.respond('reject', result.value || undefined);
    });
  }

  private respond(action: 'accept' | 'reject', motif?: string): void {
    this.responding = true;

    this.devisService.respondPublic(this.token, action, motif).subscribe({
      next: (res: any) => {
        this.responding = false;
        this.devis.statut = res.statut;
        this.devis.dateReponse = new Date().toISOString();
        if (action === 'reject') this.devis.motifRefus = motif || null;

        Swal.fire({
          icon: 'success',
          title: action === 'accept' ? 'Devis accepté' : 'Devis refusé',
          text: 'Votre réponse a bien été enregistrée.',
          timer: 2500,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.responding = false;
        Swal.fire('Erreur', err?.error?.message || "Impossible d'enregistrer votre réponse.", 'error');
      }
    });
  }
}
