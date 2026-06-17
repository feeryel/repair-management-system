import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { ClientService } from '../../../core/services/client.service';
import { AppareilService } from '../../../core/services/appareil.service';
import { DemandeService } from '../../../core/services/demande.service';
import { FactureService } from '../../../core/services/facture.service';

@Component({
  selector: 'app-reception-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './reception-dashboard.component.html'
})
export class ReceptionDashboardComponent implements OnInit {
  login           = '';
  totalClients    = 0;
  totalAppareils  = 0;
  totalDemandes   = 0;
  totalFactures   = 0;
  recentDemandes: any[] = [];

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private appareilService: AppareilService,
    private demandeService: DemandeService,
    private factureService: FactureService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.login = this.authService.getUserLogin() ?? this.translate.instant('receptionDashboard.fallbackLogin');
    this.clientService.getClients().subscribe({ next: (r: any) => this.totalClients = r.length });
    this.appareilService.getAll().subscribe({ next: (r: any) => this.totalAppareils = r.length });
    this.demandeService.getAll().subscribe({
      next: (r: any) => { this.totalDemandes = r.length; this.recentDemandes = r.slice(0, 5); }
    });
    this.factureService.getAll().subscribe({ next: (r: any) => this.totalFactures = r.length });
  }

  etatClass(etat: string): string {
    const map: Record<string, string> = { 'en_attente': 'st-pending', 'en_cours': 'st-progress', 'termine': 'st-done', 'annule': 'st-cancel' };
    return map[etat?.toLowerCase()] ?? 'st-pending';
  }
}
