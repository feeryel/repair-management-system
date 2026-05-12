import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PlanningService } from '../../../core/services/planning.service';

@Component({
  selector: 'app-planning-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planning-form.component.html'
})
export class PlanningFormComponent {

  formData = {
    dateDebut:'',
    dateFin:'',
    responsableId:null,
    DemandeReparationId:null
  };

  constructor(
    private service: PlanningService,
    private router: Router
  ) {}

  save() {

    this.service.create(this.formData).subscribe({
      next:()=>{

        alert("Planning ajouté");

        this.router.navigate(['/planning']);
      },

      error:(err)=>{
        console.log(err);
      }
    });
  }
}
