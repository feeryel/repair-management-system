import { Component, OnInit } from '@angular/core';
import { ReparationService } from '../../../core/services/reparation.service';
import { AuthService, Role } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reparation-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reparation-list.component.html',
  styleUrls: ['./reparation-list.component.css']
})
export class ReparationListComponent implements OnInit {

  reparations: any[] = [];
role: Role | '' = '';
isClient = false;
  searchText: string = '';
  filter: string = 'all';

  currentPage: number = 1;
  itemsPerPage: number = 6;

  constructor(private service: ReparationService, private authService: AuthService) {}

ngOnInit(): void {
  this.role = (this.authService.getRole() as Role) ?? '';
  this.isClient = this.role === Role.CLIENT;

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

  canChangeStatus(): boolean {
    return this.role === Role.TECHNICIEN || this.role === Role.RESPONSABLE_REPARATION;
  }

  changeStatus(id: number, newStatus: string) {
    Swal.fire({
      title: 'Confirmer',
      text: 'Marquer cette réparation comme terminée ? Un email sera envoyé au client.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, terminer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#7c3aed'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.service.updateStatus(id, newStatus).subscribe({
        next: () => {
          const rep = this.reparations.find((r: any) => r.id === id);
          if (rep) rep.status = newStatus;
          Swal.fire({ icon: 'success', title: 'Terminée !', text: 'Le client sera notifié par email.', timer: 2500, showConfirmButton: false });
        },
        error: () => Swal.fire('Erreur', 'Impossible de mettre à jour le statut.', 'error')
      });
    });
  }

}
