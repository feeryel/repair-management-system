import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { PlanningService } from '../../../core/services/planning.service';
import { UserService } from '../../../core/services/user.service';
import { DemandeService } from '../../../core/services/demande.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-planning-form',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './planning-form.component.html',
  styleUrls: ['./planning-form.component.css']
})
export class PlanningFormComponent implements OnInit {

  planning: any = {
    description: '',
    dateDebut: '',
    dateFin: '',
    technicienId: null,
    DemandeReparationId: null,
    statut: 'PLANIFIE'
  };

  techniciens: any[] = [];
  demandes: any[] = [];

  id: any;
  loading = false;

  constructor(
    private service: PlanningService,
    private userService: UserService,
    private demandeService: DemandeService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.id = this.route.snapshot.paramMap.get('id');

    this.userService.getTechniciens().subscribe({
      next: (res: any) => this.techniciens = res
    });

    this.demandeService.getAll().subscribe({
      next: (res: any) => this.demandes = res
    });

    if (this.id) {
      this.service.getOne(this.id).subscribe({
        next: (res: any) => {
          this.planning = {
            description: res.description ?? '',
            dateDebut: res.dateDebut ? res.dateDebut.substring(0, 10) : '',
            dateFin: res.dateFin ? res.dateFin.substring(0, 10) : '',
            technicienId: res.technicienId,
            DemandeReparationId: res.DemandeReparationId,
            statut: res.statut ?? 'PLANIFIE'
          };
        }
      });
    }
  }

  onDemandeChange(): void {
    const demande = this.demandes.find(d => d.id === this.planning.DemandeReparationId);
    if (demande) {
      this.planning.dateDebut = demande.dateDepot ? demande.dateDepot.substring(0, 10) : '';
      this.planning.dateFin = demande.datePrevueRep ? demande.datePrevueRep.substring(0, 10) : '';
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

    this.loading = true;

    const payload = {
      ...this.planning,
      technicienId: Number(this.planning.technicienId),
      DemandeReparationId: Number(this.planning.DemandeReparationId),
      responsableId: this.authService.getUserId()
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
