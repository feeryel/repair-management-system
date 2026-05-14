import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../models/client';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientFilterPipe } from "../../../pipes/client-filter.pipe";

import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ClientFilterPipe],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {

  clients: Client[] = [];
  searchText: string = '';
currentPage: number = 1;
itemsPerPage: number = 5;
selectedVille: string = '';
sortOrder: string = '';
 villes: string[] = [

    'Tunis',
    'Ariana',
    'Ben Arous',
    'Manouba',
    'Nabeul',
    'Zaghouan',
    'Bizerte',
    'Béja',
    'Jendouba',
    'Le Kef',
    'Siliana',
    'Sousse',
    'Monastir',
    'Mahdia',
    'Sfax',
    'Kairouan',
    'Kasserine',
    'Sidi Bouzid',
    'Gabès',
    'Médenine',
    'Tataouine',
    'Gafsa',
    'Tozeur',
    'Kébili'

  ];
  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients() {

    this.clientService.getClients().subscribe({

      next: (data) => {
        this.clients = data;
      },

      error: (err) => console.log(err)

    });

  }
filteredClients() {

  let filtered = this.clients.filter(client => {

    const matchesSearch =

      client.nom?.toLowerCase().includes(this.searchText.toLowerCase()) ||

      client.email?.toLowerCase().includes(this.searchText.toLowerCase()) ||

      client.numTel?.includes(this.searchText);

    const matchesVille =

      this.selectedVille
        ? client.adresse === this.selectedVille
        : true;

    return matchesSearch && matchesVille;

  });

  // TRI

  if(this.sortOrder === 'asc'){

    filtered.sort((a,b)=>
      a.nom.localeCompare(b.nom)
    );

  }

  if(this.sortOrder === 'desc'){

    filtered.sort((a,b)=>
      b.nom.localeCompare(a.nom)
    );

  }

  return filtered;

}
  deleteClient(id: number) {

    Swal.fire({

      title: 'Supprimer client ?',
      text: "Cette action est irréversible !",
      icon: 'warning',

      showCancelButton: true,

      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',

      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',

      background: '#ffffff',

    }).then((result) => {

      if (result.isConfirmed) {

        this.clientService.deleteClient(id).subscribe({

          next: () => {

            this.loadClients();

            Swal.fire({

              title: 'Supprimé !',
              text: 'Le client a été supprimé avec succès.',
              icon: 'success',

              confirmButtonColor: '#667eea',
              timer: 2000,
              showConfirmButton: false

            });

          },

          error: (err) => {

            console.log(err);

            Swal.fire({

              title: 'Erreur',
              text: 'Une erreur est survenue.',
              icon: 'error',

              confirmButtonColor: '#dc3545'

            });

          }

        });

      }

    });

  }

  editAlert() {

    Swal.fire({

      title: 'Modification',
      text: 'Redirection vers la page de modification...',
      icon: 'info',

      confirmButtonColor: '#667eea',
      timer: 1500,
      showConfirmButton: false

    });

  }
  // PAGINATION
get paginatedClients() {

  const filtered = this.filteredClients();

  const startIndex =
    (this.currentPage - 1) * this.itemsPerPage;

  return filtered.slice(
    startIndex,
    startIndex + this.itemsPerPage
  );

}

get totalPages(): number {

  return Math.ceil(
    this.filteredClients().length / this.itemsPerPage
  );

}

changePage(page: number) {

  if(page >= 1 && page <= this.totalPages){

    this.currentPage = page;

  }

}

}
