import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { ReparationService } from '../../../core/services/reparation.service';
import { PlanningService } from '../../../core/services/planning.service';
import { LigneReparationService } from '../../../core/services/ligne-reparation.service';

@Component({
  selector: 'app-technicien-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './technicien-dashboard.component.html'
})
export class TechnicienDashboardComponent implements OnInit {
  login           = '';
  totalRep        = 0;
  enCours         = 0;
  terminees       = 0;
  totalLignes     = 0;   // pièces + MO enregistrées dans les réparations
  mesReparations: any[] = [];
  plannings: any[]      = [];

  constructor(
    private authService: AuthService,
    private reparationService: ReparationService,
    private planningService: PlanningService,
    private ligneService: LigneReparationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.login = this.authService.getUserLogin() ?? this.translate.instant('technicienDashboard.fallbackLogin');

    this.reparationService.getAll().subscribe({
      next: (r: any) => {
        this.totalRep       = r.length;
        this.enCours        = r.filter((x: any) => x.status !== 'DONE').length;
        this.terminees      = r.filter((x: any) => x.status === 'DONE').length;
        this.mesReparations = r.slice(0, 5);
      }
    });

    const userId = this.authService.getUserId();
    if (userId) {
      this.planningService.getByTechnicien(userId).subscribe({
        next: (r: any) => this.plannings = r.slice(0, 4)
      });
    }

    this.ligneService.getAll().subscribe({
      next: (r: any) => this.totalLignes = r.length
    });
  }

  statusClass(s: string): string {
    const m: Record<string, string> = {
      DONE: 'st-done',
      IN_PROGRESS: 'st-progress',
      EN_ATTENTE_DEVIS: 'st-progress',
      REFUSEE_CLIENT: 'st-danger'
    };
    return m[s] ?? 'st-pending';
  }
  statusLabel(s: string): string {
    const m: Record<string, string> = {
      DONE: this.translate.instant('technicienDashboard.status.done'),
      IN_PROGRESS: this.translate.instant('technicienDashboard.status.inProgress'),
      EN_ATTENTE_DEVIS: this.translate.instant('technicienDashboard.status.quotePending'),
      REFUSEE_CLIENT: this.translate.instant('technicienDashboard.status.quoteRefused')
    };
    return m[s] ?? this.translate.instant('technicienDashboard.status.pending');
  }

  planningStatusClass(s: string): string {
    return s === 'TERMINE' ? 'st-done' : s === 'EN_COURS' ? 'st-progress' : 'st-pending';
  }
  planningStatusLabel(s: string): string {
    return s === 'TERMINE'
      ? this.translate.instant('technicienDashboard.planningStatus.done')
      : s === 'EN_COURS'
        ? this.translate.instant('technicienDashboard.planningStatus.inProgress')
        : this.translate.instant('technicienDashboard.planningStatus.scheduled');
  }
}
