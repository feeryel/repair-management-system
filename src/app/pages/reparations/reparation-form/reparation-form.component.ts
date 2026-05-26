import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { ReparationService } from '../../../core/services/reparation.service';
import { UserService } from '../../../core/services/user.service';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-reparation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './reparation-form.component.html',
  styleUrls: ['./reparation-form.component.css']
})
export class ReparationFormComponent implements OnInit {

  loading = false;

  reparation: any = {
    descriptionReparation: '',
    dateFinRep: '',
    tempsMainOeuvre: 1,
    demandeId: 1,
    technicienId: null,
    status: 'PENDING',
    estReparable: true
  };

  techniciens: any[] = [];

  constructor(
    private service: ReparationService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTechniciens();
  }

  loadTechniciens() {
    this.userService.getTechniciens().subscribe({
      next: (res) => {
        this.techniciens = res ?? [];
      },
      error: () => {
        this.techniciens = [];
        Swal.fire('Erreur', 'Impossible de charger les techniciens', 'error');
      }
    });
  }

  save(form: any) {

    if (form.invalid) {
      Swal.fire('Erreur', 'Formulaire invalide', 'warning');
      return;
    }

    if (
      this.reparation.tempsMainOeuvre <= 0 ||
      this.reparation.demandeId <= 0 ||
      !this.reparation.technicienId
    ) {
      Swal.fire('Erreur', 'Valeurs invalides', 'error');
      return;
    }

    this.loading = true;

    this.service.create(this.reparation).subscribe({

      next: () => {
        this.loading = false;

        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Réparation ajoutée'
        });

        this.router.navigate(['/reparations']);
      },

      error: () => {
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Échec ajout'
        });
      }

    });

  }
  cancel() {
  this.router.navigate(['/reparations']);
}
}
