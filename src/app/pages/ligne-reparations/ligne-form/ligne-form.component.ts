import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { LigneReparationService }
from '../../../core/services/ligne-reparation.service';

import { PieceService }
from '../../../core/services/piece.service';

import { ReparationService }
from '../../../core/services/reparation.service';

@Component({
  selector: 'app-ligne-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ligne-form.component.html'
})
export class LigneFormComponent
implements OnInit {

  pieces:any[] = [];

  reparations:any[] = [];

  formData = {

    quantite:1,
    PieceId:'',
    ReparationId:''

  };

  constructor(
    private service:LigneReparationService,
    private pieceService:PieceService,
    private repService:ReparationService,
    private router:Router
  ) {}

  ngOnInit(): void {

    this.loadPieces();

    this.loadReparations();

  }

  loadPieces(){

    this.pieceService.getAll().subscribe({

      next:(res:any)=>{
        this.pieces = res;
      }

    });

  }

  loadReparations(){

    this.repService.getAll().subscribe({

      next:(res:any)=>{
        this.reparations = res;
      }

    });

  }

  save(){

    this.service.create(this.formData)
    .subscribe({

      next:()=>{

        this.router.navigate([
          '/ligne-reparations'
        ]);

      }

    });

  }
}
