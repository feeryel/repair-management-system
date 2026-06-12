import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import Swal from 'sweetalert2';
import { PlanningService } from '../../../core/services/planning.service';
import { AuthService, Role } from '../../../core/services/auth.service';

@Component({
  selector: 'app-planning-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './planning-list.component.html',
  styleUrls: ['./planning-list.component.css']
})
export class PlanningListComponent implements OnInit {
isTechnicien = false;
isResponsable = false;

  plannings: any[] = [];
role: Role | '' = '';

  loading: boolean = false;

  // 👉 PAGINATION
  currentPage: number = 1;
  itemsPerPage: number = 7;

  constructor(private service: PlanningService,private authService: AuthService) {}

  ngOnInit(): void {
      this.role = (this.authService.getRole() as Role) ?? '';
      this.isTechnicien = this.role === Role.TECHNICIEN;
      this.isResponsable = this.role === Role.RESPONSABLE_REPARATION;
    this.loadData();
  }

  // =========================
  // LOAD DATA
  // =========================
  loadData() {

    this.loading = true;

    const userId = this.authService.getUserId();

    const source = this.isTechnicien && userId
      ? this.service.getByTechnicien(userId)
      : this.service.getAll();

    source.subscribe({

      next: (res: any) => {
        this.plannings = res;
        this.loading = false;
        this.currentPage = 1; // reset page
      },

      error: (err) => {

        this.loading = false;

        console.log(err);

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les plannings',
          confirmButtonColor: '#6366f1'
        });

      }

    });

  }

  // =========================
  // STATUT (TECHNICIEN)
  // =========================
  statusLabel(s: string): string {
    return s === 'TERMINE' ? 'Terminé' : s === 'EN_COURS' ? 'En cours' : 'Planifié';
  }

  statusClass(s: string): string {
    return s === 'TERMINE' ? 'st-done' : s === 'EN_COURS' ? 'st-progress' : 'st-pending';
  }

  changeStatut(p: any, statut: string) {

    this.service.updateStatut(p.id, statut).subscribe({

      next: () => {
        p.statut = statut;
        Swal.fire({ icon: 'success', title: 'Statut mis à jour', timer: 1500, showConfirmButton: false });
      },

      error: () => Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de mettre à jour le statut',
        confirmButtonColor: '#6366f1'
      })

    });

  }

  // =========================
  // DELETE WITH SWEETALERT
  // =========================
  deletePlanning(id: number) {

    Swal.fire({

      title: 'Supprimer ce planning ?',
      text: 'Cette action est irréversible',
      icon: 'warning',

      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',

      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'

    }).then((result) => {

      if (result.isConfirmed) {

        this.service.delete(id).subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Supprimé',
              text: 'Planning supprimé avec succès',
              timer: 2000,
              showConfirmButton: false
            });

            this.loadData();

          },

          error: () => {

            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Suppression impossible',
              confirmButtonColor: '#6366f1'
            });

          }

        });

      }

    });

  }

  // =========================
  // PAGINATION GETTERS
  // =========================

  get paginatedPlannings() {

    const start = (this.currentPage - 1) * this.itemsPerPage;

    return this.plannings.slice(start, start + this.itemsPerPage);

  }

  get totalPages(): number {

    return Math.ceil(this.plannings.length / this.itemsPerPage);

  }

  changePage(page: number) {

    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }

  }

}
