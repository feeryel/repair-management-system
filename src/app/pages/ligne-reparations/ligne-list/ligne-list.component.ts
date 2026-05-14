import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LigneReparationService }
from '../../../core/services/ligne-reparation.service';

@Component({
  selector: 'app-ligne-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ligne-list.component.html'
})
export class LigneListComponent
implements OnInit {

  lignes:any[] = [];

  constructor(
    private service:LigneReparationService
  ) {}

  ngOnInit(): void {

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

  delete(id:any){

    if(confirm('Supprimer ?')){

      this.service.delete(id).subscribe({

        next:()=>{

          this.loadData();

        }

      });

    }

  }
}
