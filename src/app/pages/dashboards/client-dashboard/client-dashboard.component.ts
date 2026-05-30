import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ReparationService } from '../../../core/services/reparation.service';
import { FactureService } from '../../../core/services/facture.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-dashboard.component.html'
})
export class ClientDashboardComponent implements OnInit {

  login    = '';
  clientId: number | null = null;

  // UC2 + UC3 — réparations
  reparations: any[] = [];
  totalRep   = 0;
  enCours    = 0;
  terminees  = 0;
  enAttente  = 0;

  // UC4 — factures
  factures: any[] = [];
  totalFac = 0;
  montantTotal = 0;

  // UC5 — notifications (réparations DONE non vues)
  notifications: any[] = [];

  // Onglet actif : 'reparations' | 'historique' | 'factures' | 'notifications'
  activeTab: 'reparations' | 'historique' | 'factures' | 'notifications' = 'reparations';

  loading        = true;
  loadingFactures = false;
  error          = '';

  constructor(
    private authService: AuthService,
    private reparationService: ReparationService,
    private factureService: FactureService
  ) {}

  ngOnInit(): void {
    this.login    = this.authService.getUserLogin() ?? 'Client';
    this.clientId = this.authService.getClientId();

    if (!this.clientId) {
      this.loading = false;
      this.error   = "Profil client introuvable. Contactez l'administration.";
      return;
    }

    this.loadReparations();
    this.loadFactures();
  }

  setTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
  }

  private loadReparations(): void {
    this.reparationService.getByClientId(this.clientId!).subscribe({
      next: (data: any[]) => {
        this.reparations = data;
        this.totalRep   = data.length;
        this.terminees  = data.filter(r => r.status === 'DONE').length;
        this.enCours    = data.filter(r => r.status === 'IN_PROGRESS').length;
        this.enAttente  = data.filter(r => r.status !== 'DONE' && r.status !== 'IN_PROGRESS').length;

        // Notifications = réparations passées à DONE (les 5 plus récentes)
        this.notifications = data
          .filter(r => r.status === 'DONE')
          .slice(0, 5);

        this.loading = false;
      },
      error: () => {
        this.error   = 'Impossible de charger vos réparations.';
        this.loading = false;
      }
    });
  }

  private loadFactures(): void {
    this.loadingFactures = true;
    this.factureService.getByClientId(this.clientId!).subscribe({
      next: (data: any[]) => {
        this.factures    = data;
        this.totalFac    = data.length;
        this.montantTotal = data.reduce((sum, f) => sum + (f.montantTotal ?? 0), 0);
        this.loadingFactures = false;
      },
      error: () => { this.loadingFactures = false; }
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  statusClass(status: string): string {
    const m: Record<string, string> = { DONE: 'st-done', IN_PROGRESS: 'st-progress', PENDING: 'st-pending' };
    return m[status] ?? 'st-pending';
  }

  statusLabel(status: string): string {
    const m: Record<string, string> = { DONE: 'Terminée', IN_PROGRESS: 'En cours', PENDING: 'En attente' };
    return m[status] ?? status;
  }

  getAppareil(rep: any): string {
    const a = rep?.Demande?.Appareil ?? rep?.DemandeReparation?.Appareil;
    return a ? `${a.marque ?? ''} ${a.modele ?? ''}`.trim() : 'Appareil';
  }

  getFactureAppareil(f: any): string {
    const a = f?.Reparation?.Demande?.Appareil ?? f?.Reparation?.DemandeReparation?.Appareil;
    return a ? `${a.marque ?? ''} ${a.modele ?? ''}`.trim() : 'Appareil';
  }

  get reparationsEnCours(): any[] {
    return this.reparations.filter(r => r.status !== 'DONE');
  }

  get historiqueReparations(): any[] {
    return this.reparations.filter(r => r.status === 'DONE');
  }
}
