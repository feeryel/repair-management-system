import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ReparationService } from '../../../core/services/reparation.service';
import { PlanningService } from '../../../core/services/planning.service';

@Component({
  selector: 'app-reparation-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reparation-dashboard.component.html'
})
export class ReparationDashboardComponent implements OnInit {
  login        = '';
  totalRep     = 0;
  enCours      = 0;
  terminees    = 0;
  totalPlan    = 0;
  reparations: any[] = [];
  plannings: any[]   = [];

  constructor(
    private authService: AuthService,
    private reparationService: ReparationService,
    private planningService: PlanningService
  ) {}

  ngOnInit(): void {
    this.login = this.authService.getUserLogin() ?? 'Responsable Réparation';
    this.reparationService.getAll().subscribe({
      next: (r: any) => {
        this.totalRep  = r.length;
        this.enCours   = r.filter((x: any) => x.status !== 'DONE').length;
        this.terminees = r.filter((x: any) => x.status === 'DONE').length;
        this.reparations = r.slice(0, 6);
      }
    });
    this.planningService.getAll().subscribe({
      next: (r: any) => { this.totalPlan = r.length; this.plannings = r.slice(0, 4); }
    });
  }

  statusClass(s: string): string {
    return s === 'DONE' ? 'st-done' : s === 'IN_PROGRESS' ? 'st-progress' : 'st-pending';
  }
  statusLabel(s: string): string {
    return s === 'DONE' ? 'Terminée' : s === 'IN_PROGRESS' ? 'En cours' : 'En attente';
  }
  donePercent(): number {
    return this.totalRep ? Math.round((this.terminees / this.totalRep) * 100) : 0;
  }
}
