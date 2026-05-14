import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ActivatedRoute, Router } from '@angular/router';

import { PieceService } from '../../../core/services/piece.service';

@Component({
  selector: 'app-piece-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './piece-form.component.html'
})
export class PieceFormComponent implements OnInit {

  id:any;

  formData = {

    nom:'',
    prix:0,
    quantiteStock:0

  };

  constructor(
    private service:PieceService,
    private router:Router,
    private route:ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.id = this.route.snapshot.paramMap.get('id');

    if(this.id){

      this.service.getOne(this.id).subscribe({

        next:(res:any)=>{

          this.formData = res;

        }

      });

    }
  }

  save(){

    if(this.id){

      this.service.update(this.id,this.formData).subscribe({

        next:()=>{

          this.router.navigate(['/pieces']);

        }

      });

    } else {

      this.service.add(this.formData).subscribe({

        next:()=>{

          this.router.navigate(['/pieces']);

        }

      });

    }
  }
}
