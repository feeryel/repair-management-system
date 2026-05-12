import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
 @Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,
    CommonModule,

    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loading: boolean = false;

  loginData = {
    login: '',
    motDePasse: ''
  };

  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({

      next: (res) => {

        this.loading = false;

        this.authService.saveToken(res.token);

        this.router.navigate(['/dashboard']);

      },

      error: (err) => {

        this.loading = false;

        this.errorMessage = "Login incorrect ❌";

      }

    });

  }
}
