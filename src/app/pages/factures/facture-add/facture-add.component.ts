import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FactureService } from '../../../core/services/facture.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector:'app-facture-add',
  standalone:true,
  imports:[FormsModule,CommonModule],
  templateUrl:'./facture-add.component.html'
})
export class FactureAddComponent {
formData = {
  numero: '',
  date: '',
  montantHT: 0,
  montantTVA: 0,
  timbreFiscale: 0,
  montantTotal: 0,
  ReparationId: 0
};

  constructor(
    private service:FactureService,
    private router:Router
  ) {}

  save(){

    this.service.create(this.formData).subscribe({
      next:()=>{

        this.router.navigate(['/factures']);

      },
      error:(err)=>{
        console.log(err);
      }
    });
  }
}
