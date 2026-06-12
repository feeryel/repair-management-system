import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, Role } from '../../core/services/auth.service';
import { Router } from '@angular/router';

export interface NavItem {
  label: string;
  icon:  string;
  route: string;
}

const NAV: Record<Role, NavItem[]> = {
  [Role.ADMIN]: [
    { label: 'Dashboard',        icon: 'bi-grid-1x2-fill',           route: '/admin/dashboard' },
    { label: 'Comptes',          icon: 'bi-people-fill',             route: '/admin/users' },
  ],
  [Role.CLIENT]: [
    { label: 'Dashboard',        icon: 'bi-grid-1x2-fill',           route: '/client/dashboard' },
    { label: 'Réparations',      icon: 'bi-wrench-adjustable-circle',route: '/reparations' },
    { label: 'Factures',         icon: 'bi-receipt-cutoff',          route: '/factures' },
  ],
  [Role.RECEPTION]: [
    { label: 'Dashboard',        icon: 'bi-grid-1x2-fill',           route: '/reception/dashboard' },
    { label: 'Clients',          icon: 'bi-people-fill',             route: '/clients' },
    { label: 'Appareils',        icon: 'bi-laptop-fill',             route: '/appareils' },
    { label: 'Demandes',         icon: 'bi-clipboard-check-fill',    route: '/demandes' },
    { label: 'Factures',         icon: 'bi-receipt-cutoff',          route: '/factures' },
  ],
  [Role.TECHNICIEN]: [
    { label: 'Dashboard',             icon: 'bi-grid-1x2-fill',                route: '/technicien/dashboard' },
    { label: 'Réparations',           icon: 'bi-wrench-adjustable-circle-fill',route: '/reparations' },
    { label: 'Détails réparation',    icon: 'bi-list-check',                   route: '/ligne-reparations' },
    { label: 'Planning',              icon: 'bi-calendar-event-fill',          route: '/planning' },
  ],
  [Role.RESPONSABLE_REPARATION]: [
    { label: 'Dashboard',             icon: 'bi-grid-1x2-fill',                route: '/reparation/dashboard' },
    { label: 'Planning réparation',   icon: 'bi-calendar-event-fill',          route: '/planning' },
    { label: 'Supervision',           icon: 'bi-wrench-adjustable-circle-fill',route: '/reparations' },
  ],
  [Role.ACHAT_STOCK]: [
    { label: 'Dashboard',             icon: 'bi-grid-1x2-fill',                route: '/stock/dashboard' },
    { label: 'Catalogue pièces',      icon: 'bi-box-seam-fill',                route: '/pieces' },
    { label: 'Pièces utilisées',      icon: 'bi-list-check',                   route: '/ligne-reparations' },
  ],
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  navItems: NavItem[] = [];
  userLogin = '';
  roleLabel = '';
clientName =''  ;
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const role = (this.authService.getRole() ?? '') as Role;
    this.navItems  = NAV[role] ?? [];
    this.userLogin = this.authService.getUserLogin() ?? 'Utilisateur';
      this.clientName = this.authService.getClientName() ?? '';

    this.roleLabel = this.getRoleLabel(role);
  }

  private getRoleLabel(role: Role): string {
    const labels: Record<Role, string> = {
      [Role.ADMIN]:                  'Administrateur',
      [Role.CLIENT]:                 'Client',
      [Role.RECEPTION]:  'Resp. Réception',
      [Role.TECHNICIEN]:             'Technicien',
      [Role.RESPONSABLE_REPARATION]: 'Resp. Réparation',
      [Role.ACHAT_STOCK]:'Resp. Stock',
    };
    return labels[role] ?? role;
  }

  get displayName(): string {
    if (this.clientName) return this.clientName;
    const login = this.userLogin || '';
    const atIdx = login.indexOf('@');
    return atIdx > 0 ? login.substring(0, atIdx) : (login || 'Utilisateur');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
