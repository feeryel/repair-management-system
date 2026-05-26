import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DemandeService } from '../../../core/services/demande.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-demande-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './demande-list.component.html',
  styleUrls: ['./demande-list.component.scss']
})
export class DemandeListComponent implements OnInit {

  demandes: any[] = [];

  filter: string = 'all';
  searchText: string = '';
  loading: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 6;

  constructor(private demandeService: DemandeService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    this.loading = true;

    this.demandeService.getAll().subscribe({

      next: (res) => {

        this.demandes = res;
        this.loading = false;
        this.currentPage = 1;

      },

      error: () => {

        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les demandes',
          confirmButtonColor: '#6366f1'
        });

      }

    });

  }

  // FILTER + SEARCH
  get filteredDemandes() {

    return this.demandes.filter(d => {

      const matchFilter =
        this.filter === 'all' || d.etat === this.filter;

      const matchSearch =
        d.symptomesPanne?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        d.id?.toString().includes(this.searchText);

      return matchFilter && matchSearch;

    });

  }

  // PAGINATION
  get paginatedDemandes() {

    const start = (this.currentPage - 1) * this.itemsPerPage;

    return this.filteredDemandes.slice(
      start,
      start + this.itemsPerPage
    );

  }

  get totalPages(): number {
    return Math.ceil(this.filteredDemandes.length / this.itemsPerPage);
  }

  get pagesArray(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );
  }

  goToPage(p: number) {
    this.currentPage = p;
  }

  nextPage() {
    if (this.currentPage < this.totalPages)
      this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1)
      this.currentPage--;
  }

  // FILTER BUTTON
  setFilter(value: string) {
    this.filter = value;
    this.currentPage = 1;
  }

  onSearchChange() {
    this.currentPage = 1;
  }

  // STATS
  count(etat: string) {
    return this.demandes.filter(
      d => d.etat === etat
    ).length;
  }

  // CHANGE STATUS
  changeEtat(demande: any, newEtat: string) {

    const updated = {
      ...demande,
      etat: newEtat
    };

    this.demandeService.update(
      demande.id,
      updated
    ).subscribe({

      next: () => {

        demande.etat = newEtat;

        Swal.fire({
          icon: 'success',
          title: 'État modifié',
          text: 'Le statut a été mis à jour',
          timer: 1500,
          showConfirmButton: false
        });

      },

      error: () => {

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Modification impossible',
          confirmButtonColor: '#6366f1'
        });

      }

    });

  }

  // DELETE
  delete(id: number) {

    Swal.fire({

      title: 'Supprimer cette demande ?',
      text: 'Cette action est irréversible !',
      icon: 'warning',

      showCancelButton: true,

      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',

      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'

    }).then((result) => {

      if (result.isConfirmed) {

        this.demandeService.delete(id).subscribe({

          next: () => {

            this.loadData();

            Swal.fire({
              icon: 'success',
              title: 'Supprimée',
              text: 'La demande a été supprimée avec succès',
              confirmButtonColor: '#22c55e'
            });

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

}
