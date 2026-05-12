import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ReparationService } from '../../../core/services/reparation.service';

@Component({
  selector: 'app-reparation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reparation-form.component.html',
  styleUrls: ['./reparation-form.component.css']
})
export class ReparationFormComponent {

  reparation = {
    dateFinRep: '',
    descriptionReparation: '',
    tempsMainOeuvre: '',
    estReparable: true,
    demandeId: '',
    technicienId: '',
    status: 'IN_PROGRESS'
  };

  constructor(
    private service: ReparationService,
    private router: Router
  ) {}

  save() {

    this.service.create(this.reparation).subscribe({
      next: () => {

        alert('Réparation ajoutée');

        this.router.navigate(['/reparations']);
      },

      error: (err) => {
        console.log(err);
      }
    });
  }
}
