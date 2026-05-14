import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PieceService } from '../../../core/services/piece.service';

@Component({
  selector: 'app-piece-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './piece-list.component.html'
})
export class PieceListComponent implements OnInit {

  pieces:any[] = [];

  constructor(private service:PieceService) {}

  ngOnInit(): void {

    this.loadData();

  }

  loadData() {

    this.service.getAll().subscribe({

      next:(res:any)=>{

        this.pieces = res;

      },

      error:(err)=>{
        console.log(err);
      }

    });

  }

  delete(id:any){

    if(confirm('Supprimer cette pièce ?')){

      this.service.delete(id).subscribe({

        next:()=>{

          this.loadData();

        },

        error:(err)=>{
          console.log(err);
        }

      });

    }

  }
}
