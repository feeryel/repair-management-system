import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { PlanningService } from '../../../core/services/planning.service';

@Component({
  selector: 'app-planning-form',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './planning-form.component.html',
  styleUrls: ['./planning-form.component.scss']
})
export class PlanningFormComponent implements OnInit {

  planning: any = {
    dateDebut: '',
    dateFin: '',
    responsableId: null,
    DemandeReparationId: null
  };

  id: any;
  loading = false;

  constructor(
    private service: PlanningService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      this.service.getOne(this.id).subscribe({
        next: (res: any) => this.planning = res
      });
    }
  }

  save(form: any) {

    // force touch validation
    if (form.invalid) {
      Object.keys(form.controls).forEach(k =>
        form.controls[k].markAsTouched()
      );

      Swal.fire({
        icon: 'warning',
        title: 'Formulaire incomplet',
        text: 'Veuillez remplir tous les champs correctement'
      });

      return;
    }

    // ❌ validation IDs > 0
    if (
      this.planning.responsableId <= 0 ||
      this.planning.DemandeReparationId <= 0
    ) {
      Swal.fire({
        icon: 'error',
        title: 'IDs invalides',
        text: 'Les IDs doivent être strictement supérieurs à 0'
      });
      return;
    }

    this.loading = true;

    const payload = {
      ...this.planning,
      responsableId: Number(this.planning.responsableId),
      DemandeReparationId: Number(this.planning.DemandeReparationId)
    };

    const request = this.id
      ? this.service.update(this.id, payload)
      : this.service.create(payload);

    request.subscribe({
      next: () => {

        this.loading = false;

        Swal.fire({
          icon: 'success',
          title: this.id ? 'Modifié' : 'Ajouté',
          text: 'Opération réussie'
        });

        this.router.navigate(['/planning']);
      },

      error: () => {
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue'
        });
      }
    });
  }
}
