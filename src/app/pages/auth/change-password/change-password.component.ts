import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {

  ancienMotDePasse = '';
  nouveauMotDePasse = '';
  confirmationMotDePasse = '';

  showAncien = false;
  showNouveau = false;
  showConfirmation = false;

  loading = false;

  constructor(private authService: AuthService, private translate: TranslateService) {}

  save(): void {

    if (!this.ancienMotDePasse || !this.nouveauMotDePasse || !this.confirmationMotDePasse) {
      Swal.fire(this.translate.instant('changePwd.requiredFieldsTitle'), this.translate.instant('changePwd.requiredFieldsText'), 'warning');
      return;
    }

    if (this.nouveauMotDePasse.length < 6) {
      Swal.fire(this.translate.instant('changePwd.tooShortTitle'), this.translate.instant('changePwd.tooShortText'), 'warning');
      return;
    }

    if (this.nouveauMotDePasse !== this.confirmationMotDePasse) {
      Swal.fire(this.translate.instant('changePwd.errorTitle'), this.translate.instant('changePwd.mismatchText'), 'warning');
      return;
    }

    this.loading = true;

    this.authService.changePassword({
      ancienMotDePasse: this.ancienMotDePasse,
      nouveauMotDePasse: this.nouveauMotDePasse
    }).subscribe({

      next: () => {
        this.loading = false;

        Swal.fire({
          icon: 'success',
          title: this.translate.instant('changePwd.successTitle'),
          text: this.translate.instant('changePwd.successText'),
          confirmButtonColor: '#7c3aed'
        });

        this.ancienMotDePasse = '';
        this.nouveauMotDePasse = '';
        this.confirmationMotDePasse = '';
      },

      error: (err) => {
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: this.translate.instant('changePwd.errorTitle'),
          text: err?.error?.message || this.translate.instant('changePwd.genericError'),
          confirmButtonColor: '#dc3545'
        });
      }

    });

  }

}
