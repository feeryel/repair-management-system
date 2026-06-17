import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, Role } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export interface NavItem {
  label: string;
  icon:  string;
  route: string;
}

const NAV: Record<Role, NavItem[]> = {
  [Role.ADMIN]: [
    { label: 'nav.dashboard',        icon: 'bi-grid-1x2-fill',           route: '/admin/dashboard' },
    { label: 'nav.accounts',         icon: 'bi-people-fill',             route: '/admin/users' },
    { label: 'nav.history',          icon: 'bi-clock-history',           route: '/admin/audit-logs' },
  ],
  [Role.CLIENT]: [
    { label: 'nav.dashboard',        icon: 'bi-grid-1x2-fill',           route: '/client/dashboard' },
    { label: 'nav.repairs',          icon: 'bi-wrench-adjustable-circle',route: '/reparations' },
    { label: 'nav.invoices',         icon: 'bi-receipt-cutoff',          route: '/factures' },
  ],
  [Role.RECEPTION]: [
    { label: 'nav.dashboard',        icon: 'bi-grid-1x2-fill',           route: '/reception/dashboard' },
    { label: 'nav.clients',          icon: 'bi-people-fill',             route: '/clients' },
    { label: 'nav.devices',          icon: 'bi-laptop-fill',             route: '/appareils' },
    { label: 'nav.requests',         icon: 'bi-clipboard-check-fill',    route: '/demandes' },
    { label: 'nav.invoices',         icon: 'bi-receipt-cutoff',          route: '/factures' },
  ],
  [Role.TECHNICIEN]: [
    { label: 'nav.dashboard',             icon: 'bi-grid-1x2-fill',                route: '/technicien/dashboard' },
    { label: 'nav.repairs',               icon: 'bi-wrench-adjustable-circle-fill',route: '/reparations' },
    { label: 'nav.repairDetails',         icon: 'bi-list-check',                   route: '/ligne-reparations' },
    { label: 'nav.planning',              icon: 'bi-calendar-event-fill',          route: '/planning' },
  ],
  [Role.RESPONSABLE_REPARATION]: [
    { label: 'nav.dashboard',             icon: 'bi-grid-1x2-fill',                route: '/reparation/dashboard' },
    { label: 'nav.repairPlanning',        icon: 'bi-calendar-event-fill',          route: '/planning' },
    { label: 'nav.supervision',           icon: 'bi-wrench-adjustable-circle-fill',route: '/reparations' },
  ],
  [Role.ACHAT_STOCK]: [
    { label: 'nav.dashboard',             icon: 'bi-grid-1x2-fill',                route: '/stock/dashboard' },
    { label: 'nav.partsCatalog',          icon: 'bi-box-seam-fill',                route: '/pieces' },
    { label: 'nav.usedParts',             icon: 'bi-list-check',                   route: '/ligne-reparations' },
  ],
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  navItems: NavItem[] = [];
  userLogin = '';
  roleKey = '';
clientName =''  ;
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const role = (this.authService.getRole() ?? '') as Role;
    this.navItems  = NAV[role] ?? [];
    this.userLogin = this.authService.getUserLogin() ?? 'Utilisateur';
      this.clientName = this.authService.getClientName() ?? '';

    this.roleKey = role ? 'roles.' + role : '';
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
