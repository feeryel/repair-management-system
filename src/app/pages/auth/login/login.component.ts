import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService, Role } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TranslateModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loading = false;

  loginData = {
    login: '',
    motDePasse: ''
  };

  errorMessage = '';

  /** Contrôle la visibilité du mot de passe */
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  // ─────────────────────────────────────────
  // Soumission du formulaire
  // ─────────────────────────────────────────

  login(): void {

    // Validation basique côté client
    if (!this.loginData.login.trim() || !this.loginData.motDePasse.trim()) {
      this.errorMessage = this.translate.instant('login.fillAllFields');
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({

      next: (res) => {

        this.loading = false;

        // ✅ CORRECTION : sauvegarde token + rôle + userId + login
        // en une seule opération atomique via saveSession()
        //
        // Cas couverts :
        //   • Backend renvoie { token, role, userId, login }  → tout sauvegardé directement
        //   • Backend renvoie { token } seulement             → rôle extrait du payload JWT
   this.authService.saveSession(
  res.token,
  res.role,
  res.userId,
  res.login ?? this.loginData.login,
  res.clientId,      res.clientName   // ✅ FIX IMPORTANT

);

        // Redirection selon le rôle persisté
        this.redirectByRole();
      },

      error: () => {

        this.loading = false;
        this.errorMessage = this.translate.instant('login.error');

      }

    });

  }

  // ─────────────────────────────────────────
  // Redirection selon le rôle
  // ─────────────────────────────────────────

  private redirectByRole(): void {
    const destinations: Record<string, string> = {
      [Role.ADMIN]:                  '/admin/dashboard',
      [Role.CLIENT]:                 '/client/dashboard',
      [Role.RECEPTION]:  '/reception/dashboard',
      [Role.TECHNICIEN]:             '/technicien/dashboard',
      [Role.RESPONSABLE_REPARATION]: '/reparation/dashboard',
      [Role.ACHAT_STOCK]:'/stock/dashboard',
    };
    const role = this.authService.getRole() ?? '';
    const dest = destinations[role] ?? '/dashboard';
    this.router.navigate([dest]);
  }

  // ─────────────────────────────────────────
  // Toggle visibilité mot de passe
  // ─────────────────────────────────────────

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // ─────────────────────────────────────────
  // Mot de passe oublié
  // ─────────────────────────────────────────

  forgotPassword(): void {
    const t = (k: string) => this.translate.instant(k);
    Swal.fire({
      title: t('login.forgotTitle'),
      text: t('login.forgotText'),
      input: 'email',
      inputValue: this.loginData.login,
      inputPlaceholder: t('login.forgotPlaceholder'),
      showCancelButton: true,
      confirmButtonText: t('login.forgotSend'),
      cancelButtonText: t('common.cancel'),
      confirmButtonColor: '#2563eb',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return t('login.forgotEmailRequired');
        }
        return null;
      }
    }).then((result) => {
      if (!result.isConfirmed || !result.value) return;

      const email = result.value.trim();

      Swal.fire({
        title: t('login.forgotSending'),
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      this.authService.forgotPassword(email).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: t('login.forgotSuccessTitle'),
            text: res?.message || t('login.forgotSuccessText'),
            confirmButtonColor: '#2563eb'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: t('login.forgotErrorTitle'),
            text: err?.error?.message || t('login.forgotErrorText'),
            confirmButtonColor: '#dc3545'
          });
        }
      });
    });
  }

}
