import { Component, OnInit } from '@angular/core';
import { ReparationService } from '../../../core/services/reparation.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-reparation-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
    templateUrl: './reparation-list.component.html',
      styleUrls: ['./reparation-list.component.css']

})
export class ReparationListComponent implements OnInit {

  reparations:any[] = [];

  constructor(private service: ReparationService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    this.service.getAll().subscribe({
      next:(res:any)=>{

        this.reparations = res;

      },
      error:(err)=>{
        console.log(err);
      }
    });
  }
}
