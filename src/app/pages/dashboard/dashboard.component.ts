import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientService } from '../../core/services/client.service';
import { ReparationService } from '../../core/services/reparation.service';
import { FactureService } from '../../core/services/facture.service';
import { PieceService } from '../../core/services/piece.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  totalClients = 0;
  totalReparations = 0;
  totalFactures = 0;
  totalPieces = 0;
showNotifications = false;

notifications: any[] = [];
  latestReparations: any[] = [];

  donePercent = 0;
  pendingPercent = 0;

  constructor(
    private clientService: ClientService,
    private reparationService: ReparationService,
    private factureService: FactureService,
    private pieceService: PieceService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadReparations();
    this.loadFactures();
    this.loadPieces();
  }

  loadClients() {
    this.clientService.getClients().subscribe({
      next: (res: any) => this.totalClients = res.length
    });
  }
toggleNotifications() {
  this.showNotifications = !this.showNotifications;
}
  loadReparations() {
    this.reparationService.getAll().subscribe({
      next: (res: any) => {

        this.totalReparations = res.length;

        this.latestReparations = res.slice(0, 5);

        const done = res.filter((r: any) => r.status === 'DONE').length;

        this.donePercent = Math.round((done / res.length) * 100) || 0;

        this.pendingPercent = 100 - this.donePercent;
this.notifications = res.slice(0, 5).map((r: any) => {
  return {
    title: r.status === 'DONE'
      ? 'Réparation terminée'
      : 'Réparation en cours',

    message: r.descriptionReparation,

    type: r.status
  };
});
      }
    });
  }

  loadFactures() {
    this.factureService.getAll().subscribe({
      next: (res: any) => this.totalFactures = res.length
    });
  }

  loadPieces() {
    this.pieceService.getAll().subscribe({
      next: (res: any) => this.totalPieces = res.length
    });
  }
}
