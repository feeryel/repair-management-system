import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DevisService } from '../../../core/services/devis.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-devis-public',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
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
    private devisService: DevisService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const token = params.get('token');

      if (!token) {
        this.loading = false;
        this.error = this.translate.instant('devisPublic.errInvalidLink');
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
          this.error = this.translate.instant('devisPublic.errNotFound');
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
      title: this.translate.instant('devisPublic.acceptTitle'),
      text: this.translate.instant('devisPublic.acceptText'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('devisPublic.acceptConfirm'),
      cancelButtonText: this.translate.instant('common.cancel'),
      confirmButtonColor: '#10b981'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.respond('accept');
    });
  }

  reject(): void {
    Swal.fire({
      title: this.translate.instant('devisPublic.rejectTitle'),
      text: this.translate.instant('devisPublic.rejectText'),
      input: 'textarea',
      inputPlaceholder: this.translate.instant('devisPublic.motifPlaceholder'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('devisPublic.rejectConfirm'),
      cancelButtonText: this.translate.instant('common.cancel'),
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
          title: action === 'accept' ? this.translate.instant('devisPublic.acceptedTitle') : this.translate.instant('devisPublic.refusedTitle'),
          text: this.translate.instant('devisPublic.responseSaved'),
          timer: 2500,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.responding = false;
        Swal.fire(this.translate.instant('devisPublic.errorTitle'), err?.error?.message || this.translate.instant('devisPublic.errSaveResponse'), 'error');
      }
    });
  }
}
