import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ReparationService } from '../../../core/services/reparation.service';
import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  totalUsers       = 0;
  totalClients     = 0;
  totalReparations = 0;
  recentUsers: any[] = [];
  login = '';

  constructor(
    private userService: UserService,
    private reparationService: ReparationService,
    private clientService: ClientService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.login = this.authService.getUserLogin() ?? 'Admin';
    this.userService.getAll().subscribe({ next: (r: any) => { this.totalUsers = r.length; this.recentUsers = r.slice(0, 6); } });
    this.clientService.getClients().subscribe({ next: (r: any) => this.totalClients = r.length });
    this.reparationService.getAll().subscribe({ next: (r: any) => this.totalReparations = r.length });
  }

  roleBadge(role: string): string {
    const map: Record<string, string> = {
      admin: 'badge-admin', client: 'badge-client',
      technicien: 'badge-tech', reception: 'badge-recep',
      responsable_reparation: 'badge-rep', achat_stock: 'badge-stock'
    };
    return map[role] ?? 'badge-default';
  }

  roleLabel(role: string): string {
    const map: Record<string, string> = {
      admin: 'Admin', client: 'Client', technicien: 'Technicien',
      reception: 'Réception', responsable_reparation: 'Réparation',
      achat_stock: 'Stock'
    };
    return map[role] ?? role;
  }
}
