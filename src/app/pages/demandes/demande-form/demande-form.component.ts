import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DemandeService } from '../../../core/services/demande.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-demande-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './demande-form.component.html',
  styleUrls: ['./demande-form.component.scss']
})
export class DemandeFormComponent implements OnInit {

  demande: any = {
    dateDepot: '',
    datePrevueRep: '',
    symptomesPanne: '',
    etat: 'En attente',
    idEtiquette: null,
    appareilId: null
  };

  id: any;
  loading: boolean = false;

  constructor(
    private demandeService: DemandeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {

      this.loading = true;

      this.demandeService.getOne(this.id).subscribe({

        next: (res: any) => {
          this.demande = res;
          this.loading = false;
        },

        error: () => {
          this.loading = false;
        }

      });

    }

  }

  save(form: any) {

  // VALIDATION FORM
  if (form.invalid) {

    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsTouched();
    });

    Swal.fire({
      icon: 'warning',
      title: 'Formulaire invalide',
      text: 'Veuillez remplir tous les champs obligatoires',
      confirmButtonColor: '#6366f1'
    });

    return;
  }

  // VALIDATION IDS
  if (
    Number(this.demande.appareilId) <= 0 ||
    Number(this.demande.idEtiquette) <= 0
  ) {

    Swal.fire({
      icon: 'warning',
      title: 'ID invalide',
      text: 'Les IDs doivent être supérieurs à 0',
      confirmButtonColor: '#6366f1'
    });

    return;
  }

  this.loading = true;

  const payload = {
    ...this.demande,
    appareilId: Number(this.demande.appareilId),
    idEtiquette: Number(this.demande.idEtiquette)
  };

  // UPDATE
  if (this.id) {

    this.demandeService.update(this.id, payload).subscribe({

      next: () => {

        this.loading = false;

        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Demande modifiée avec succès',
          confirmButtonColor: '#22c55e'
        });

        this.router.navigate(['/demandes']);
      },

      error: (err) => {

        this.loading = false;

        console.log(err);

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la modification',
          confirmButtonColor: '#ef4444'
        });

      }

    });

  }

  // ADD
  else {

    this.demandeService.add(payload).subscribe({

      next: () => {

        this.loading = false;

        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Demande ajoutée avec succès',
          confirmButtonColor: '#22c55e'
        });

        this.router.navigate(['/demandes']);
      },

      error: (err) => {

        this.loading = false;

        console.log(err);

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de l’ajout',
          confirmButtonColor: '#ef4444'
        });

      }

    });

  }

}
}
