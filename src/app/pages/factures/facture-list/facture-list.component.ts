import { Component, OnInit } from '@angular/core';
import { FactureService } from '../../../core/services/facture.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-facture-list',
standalone:true,
  imports:[FormsModule,RouterModule,CommonModule],
  templateUrl: './facture-list.component.html',
})
export class FactureListComponent implements OnInit {

  factures:any[]=[];

  constructor(private service:FactureService){}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){

    this.service.getAll().subscribe({
      next:(res:any)=>{

        this.factures = res;

      },
      error:(err)=>{
        console.log(err);
      }
    });
  }
}
