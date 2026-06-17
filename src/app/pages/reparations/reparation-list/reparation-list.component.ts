import { Component, OnInit } from '@angular/core';
import { ReparationService } from '../../../core/services/reparation.service';
import { DevisService } from '../../../core/services/devis.service';
import { AuthService, Role } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

const TARIF_HORAIRE_MAIN_OEUVRE = 30; // TND / heure

@Component({
  selector: 'app-reparation-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './reparation-list.component.html',
  styleUrls: ['./reparation-list.component.css']
})
export class ReparationListComponent implements OnInit {

  reparations: any[] = [];
role: Role | '' = '';
isClient = false;
isTechnicien = false;

  searchText: string = '';
  filter: string = 'all';
  Role = Role; // ✅ IMPORTANT FIX

  currentPage: number = 1;
  itemsPerPage: number = 6;

  constructor(
    private service: ReparationService,
    private devisService: DevisService,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

ngOnInit(): void {
  this.role = (this.authService.getRole() as Role) ?? '';
  this.isClient = this.role === Role.CLIENT;
  this.isTechnicien = this.role === Role.TECHNICIEN;

  this.loadData();
}

  loadData() {
    const role = this.authService.getRole();

    if (role === Role.CLIENT) {
      const clientId = this.authService.getClientId();
      if (clientId) {
        this.service.getByClientId(clientId).subscribe({
          next: (res: any) => {
            this.reparations = res;
          },
          error: (err) => console.log(err)
        });
      }
    } else {
      this.service.getAll().subscribe({
        next: (res: any) => {
          this.reparations = res;
        },
        error: (err) => console.log(err)
      });
    }
  }

  setFilter(value: string) {
    this.filter = value;
    this.currentPage = 1;
  }

  get filteredReparations() {

    return this.reparations.filter(r => {

      const matchStatus =
        this.filter === 'all' || r.status === this.filter;

      const matchSearch =
        r.descriptionReparation?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        r.id?.toString().includes(this.searchText);

      return matchStatus && matchSearch;
    });

  }

  get paginatedReparations() {

    const start = (this.currentPage - 1) * this.itemsPerPage;

    return this.filteredReparations.slice(start, start + this.itemsPerPage);

  }

  get totalPages(): number {
    return Math.ceil(this.filteredReparations.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getAppareil(r: any): string {
    const a = r?.Demande?.Appareil ?? r?.DemandeReparation?.Appareil;
    return a ? `${a.marque ?? ''} ${a.modele ?? ''}`.trim() : '—';
  }

  canChangeStatus(): boolean {
    return this.role === Role.TECHNICIEN || this.role === Role.RESPONSABLE_REPARATION;
  }

  changeStatus(id: number, newStatus: string) {
    Swal.fire({
      title: this.translate.instant('reparationList.confirm'),
      text: this.translate.instant('reparationList.confirmDoneText'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('reparationList.yesFinish'),
      cancelButtonText: this.translate.instant('common.cancel'),
      confirmButtonColor: '#7c3aed'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.service.updateStatus(id, newStatus).subscribe({
        next: () => {
          const rep = this.reparations.find((r: any) => r.id === id);
          if (rep) rep.status = newStatus;
          Swal.fire({ icon: 'success', title: this.translate.instant('reparationList.finishedTitle'), text: this.translate.instant('reparationList.clientNotifiedEmail'), timer: 2500, showConfirmButton: false });
        },
        error: () => Swal.fire(
          this.translate.instant('reparationList.errorTitle'),
          this.translate.instant('reparationList.updateStatusError'),
          'error'
        )
      });
    });
  }

  statusLabel(status: string): string {
    const keys: Record<string, string> = {
      EN_ATTENTE_DEVIS: 'reparationList.statusQuotePending',
      REFUSEE_CLIENT: 'reparationList.statusQuoteRefused'
    };
    return keys[status] ? this.translate.instant(keys[status]) : status;
  }

  canSendDevis(r: any): boolean {
    return this.role === Role.RESPONSABLE_REPARATION
      && r.status === 'IN_PROGRESS'
      && !r.Devis
      && ((r.LigneReparations?.length ?? 0) > 0 || (r.tempsMainOeuvre ?? 0) > 0);
  }

  private calculateMontant(r: any) {
    const lignes = r.LigneReparations ?? [];
    const montantPieces = lignes.reduce((sum: number, l: any) => sum + (l.quantite || 0) * (l.prixHT || 0), 0);
    const montantMainOeuvre = (r.tempsMainOeuvre || 0) * TARIF_HORAIRE_MAIN_OEUVRE;
    const montantHT = montantPieces + montantMainOeuvre;
    const montantTVA = montantHT * 0.19;
    const timbreFiscale = 1;
    const montantTotal = montantHT + montantTVA + timbreFiscale;
    return { montantPieces, montantMainOeuvre, montantHT, montantTVA, timbreFiscale, montantTotal };
  }

  sendDevis(r: any) {
    const { montantPieces, montantMainOeuvre, montantHT, montantTVA, timbreFiscale, montantTotal } = this.calculateMontant(r);

    Swal.fire({
      title: this.translate.instant('reparationList.sendQuoteTitle'),
      html: `
        <div style="text-align:left">
          <p>${this.translate.instant('reparationList.quoteParts')}&nbsp;: <strong>${montantPieces.toFixed(2)} TND</strong></p>
          <p>${this.translate.instant('reparationList.quoteLabor', { value: r.tempsMainOeuvre || 0 })}&nbsp;: <strong>${montantMainOeuvre.toFixed(2)} TND</strong></p>
          <p>${this.translate.instant('reparationList.quoteHT')}&nbsp;: <strong>${montantHT.toFixed(2)} TND</strong></p>
          <p>${this.translate.instant('reparationList.quoteTVA')}&nbsp;: <strong>${montantTVA.toFixed(2)} TND</strong></p>
          <p>${this.translate.instant('reparationList.quoteStamp')}&nbsp;: <strong>${timbreFiscale.toFixed(2)} TND</strong></p>
          <p>${this.translate.instant('reparationList.quoteTotal')}&nbsp;: <strong>${montantTotal.toFixed(2)} TND</strong></p>
          <p>${this.translate.instant('reparationList.quoteClientNotice')}</p>
        </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('reparationList.send'),
      cancelButtonText: this.translate.instant('common.cancel'),
      confirmButtonColor: '#7c3aed'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.devisService.create(r.id).subscribe({
        next: (devis: any) => {
          r.Devis = devis;
          r.status = 'EN_ATTENTE_DEVIS';
          Swal.fire({ icon: 'success', title: this.translate.instant('reparationList.quoteSentTitle'), text: this.translate.instant('reparationList.clientNotifiedEmailWhatsapp'), timer: 2500, showConfirmButton: false });
        },
        error: (err) => Swal.fire(
          this.translate.instant('reparationList.errorTitle'),
          err?.error?.message || this.translate.instant('reparationList.sendQuoteError'),
          'error'
        )
      });
    });
  }

}
