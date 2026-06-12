import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { LigneReparationService }
from '../../../core/services/ligne-reparation.service';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-ligne-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ligne-list.component.html',
  styleUrls: ['./ligne-list.component.css']
})
export class LigneListComponent
implements OnInit {

  lignes:any[] = [];
  searchText: string = '';
  isAchatStock = false;

  constructor(
    private service:LigneReparationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.isAchatStock = this.authService.isAchatStock();

    this.loadData();

  }

  loadData(){

    this.service.getAll().subscribe({

      next:(res:any)=>{

        this.lignes = res;

      },

      error:(err)=>{
        console.log(err);
      }

    });

  }

  get filteredLignes() {

    const term = this.searchText.toLowerCase().trim();

    if (!term) return this.lignes;

    return this.lignes.filter(l =>
      l.Piece?.nom?.toLowerCase().includes(term) ||
      l.Piece?.code?.toLowerCase().includes(term) ||
      l.ReparationId?.toString().includes(term)
    );

  }

  get totalLignes(): number {
    return this.lignes.length;
  }

  get totalQuantite(): number {
    return this.lignes.reduce((sum, l) => sum + (l.quantite || 0), 0);
  }

  get totalValeur(): number {
    return this.lignes.reduce((sum, l) => sum + this.ligneTotal(l), 0);
  }

  ligneTotal(l:any): number {
    return (l.quantite || 0) * (l.Piece?.prixHT || 0);
  }

  delete(id:any){

    Swal.fire({
      title: 'Supprimer cette ligne ?',
      text: 'Cette pièce ne sera plus comptée dans la réparation.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc2626'
    }).then(result => {

      if (!result.isConfirmed) return;

      this.service.delete(id).subscribe({

        next:()=>{
          Swal.fire({ icon: 'success', title: 'Ligne supprimée', timer: 1500, showConfirmButton: false });
          this.loadData();
        },

        error: () => Swal.fire('Erreur', 'Impossible de supprimer cette ligne.', 'error')

      });

    });

  }
}
