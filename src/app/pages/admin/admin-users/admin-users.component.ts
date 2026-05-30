import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  loading      = false;
  showForm     = false;
  errorMsg     = '';
  successMsg   = '';

  newUser = { login: '', motDePasse: '', role: 'technicien' };

  // CLIENT exclu — créé uniquement par la Réception
  roles = [
    { value: 'admin',                  label: 'Administrateur' },
    { value: 'technicien',             label: 'Technicien' },
    { value: 'reception',              label: 'Réception' },
    { value: 'responsable_reparation', label: 'Responsable Réparation' },
    { value: 'achat_stock',            label: 'Achat & Stock' },
  ];

  constructor(private userService: UserService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (r) => { this.users = r; this.loading = false; },
      error: () => this.loading = false
    });
  }

  add(): void {
    this.errorMsg = '';
    if (!this.newUser.login.trim() || !this.newUser.motDePasse.trim()) {
      this.errorMsg = 'Login et mot de passe obligatoires.'; return;
    }
    this.userService.add(this.newUser).subscribe({
      next: () => {
        this.successMsg = `Compte ${this.newUser.login} créé.`;
        this.showForm   = false;
        this.newUser    = { login: '', motDePasse: '', role: 'technicien' };
        this.load();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (e) => this.errorMsg = e.error?.message ?? 'Erreur lors de la création.'
    });
  }

  desactiver(u: any): void {
    if (!confirm(`Désactiver le compte de ${u.login} ?`)) return;
    this.userService.desactiver(u.id).subscribe({
      next: () => { this.flash(`Compte ${u.login} désactivé.`); this.load(); },
      error: (e) => this.flash(e.error?.message ?? 'Erreur', true)
    });
  }

  reactiver(u: any): void {
    this.userService.reactiver(u.id).subscribe({
      next: () => { this.flash(`Compte ${u.login} réactivé.`); this.load(); },
      error: (e) => this.flash(e.error?.message ?? 'Erreur', true)
    });
  }

  bannir(u: any): void {
    if (!confirm(`Bannir définitivement le compte de ${u.login} ?`)) return;
    this.userService.bannir(u.id).subscribe({
      next: () => { this.flash(`Compte ${u.login} banni.`); this.load(); },
      error: (e) => this.flash(e.error?.message ?? 'Erreur', true)
    });
  }

  statusClass(u: any): string {
    if (u.bannit)       return 'st-banni';
    if (!u.actif)       return 'st-inactif';
    return 'st-actif';
  }

  statusLabel(u: any): string {
    if (u.bannit) return 'Banni';
    if (!u.actif) return 'Inactif';
    return 'Actif';
  }

  roleBadge(r: string): string {
    const m: Record<string, string> = {
      admin: 'badge-admin', client: 'badge-client', technicien: 'badge-tech',
      reception: 'badge-recep', responsable_reparation: 'badge-rep', achat_stock: 'badge-stock'
    };
    return m[r] ?? 'badge-default';
  }

  roleLabel(r: string): string {
    return this.roles.find(x => x.value === r)?.label ?? r;
  }

  private flash(msg: string, isError = false): void {
    if (isError) { this.errorMsg = msg; setTimeout(() => this.errorMsg = '', 4000); }
    else         { this.successMsg = msg; setTimeout(() => this.successMsg = '', 3000); }
  }
}
