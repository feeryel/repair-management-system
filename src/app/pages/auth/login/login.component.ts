import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService, Role } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
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
    private router: Router
  ) {}

  // ─────────────────────────────────────────
  // Soumission du formulaire
  // ─────────────────────────────────────────

  login(): void {

    // Validation basique côté client
    if (!this.loginData.login.trim() || !this.loginData.motDePasse.trim()) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
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
        this.errorMessage = 'Login ou mot de passe incorrect';

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

}
