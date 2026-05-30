import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService,Role } from '../../core/services/auth.service';



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
  ],
};

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
userLogin = '';
roleLabel = '';
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  ngOnInit() {
        const role = (this.authService.getRole() ?? '') as Role;

    this.userLogin = this.authService.getUserLogin() ?? 'Utilisateur';
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
  logout() {

    this.authService.logout();

    this.router.navigate(['/']);

  }

}
