import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';

import { DemandeService } from '../../../core/services/demande.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-demande-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './demande-list.component.html',
  styleUrls: ['./demande-list.component.scss']
})
export class DemandeListComponent implements OnInit {

  demandes: any[] = [];

  constructor(
    private demandeService: DemandeService
  ) {}

  ngOnInit(): void {

    this.loadData();

  }

  loadData() {

    this.demandeService.getAll().subscribe({

      next: (res) => {

        this.demandes = res;

      },

      error: (err) => {

        console.log(err);

      }

    });

  }
changeEtat(demande:any, newEtat:any){

  const data = {
    ...demande,
    etat:newEtat
  };

  this.demandeService.update(demande.id,data).subscribe({

    next:()=>{

      demande.etat = newEtat;

      alert('Etat modifié');

    },

    error:(err)=>{
      console.log(err);
    }

  });

}
  delete(id: number) {

    if(confirm('Supprimer cette demande ?')){

      this.demandeService.delete(id).subscribe({

        next:()=>{

          alert('Demande supprimée');

          this.loadData();

        },

        error:(err)=>{
          console.log(err);
        }

      });

    }

  }

}
