import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PlanningService } from '../../../core/services/planning.service';

@Component({
  selector: 'app-planning-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './planning-list.component.html'
})
export class PlanningListComponent implements OnInit {

  plannings:any[] = [];

  constructor(private service: PlanningService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.service.getAll().subscribe({
      next:(res:any)=>{
        this.plannings = res;
      },
      error:(err)=>{
        console.log(err);
      }
    });
  }
}
