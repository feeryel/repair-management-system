import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService,Role } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationService } from '../../core/services/notification.service';
import { LanguageService, Lang } from '../../core/services/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';



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
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
userLogin = '';
roleKey = '';
clientName = '';

notifications: any[] = [];
unreadCount = 0;
showNotifDropdown = false;
private notifPolling?: ReturnType<typeof setInterval>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private notificationService: NotificationService,
    private languageService: LanguageService,
    private translate: TranslateService
  ) {}


  ngOnInit() {
        const role = (this.authService.getRole() ?? '') as Role;

    this.userLogin = this.authService.getUserLogin() ?? 'Utilisateur';
        this.roleKey = role ? 'roles.' + role : '';
  this.clientName = this.authService.getClientName() ?? '';

  this.loadUnreadCount();
  this.notifPolling = setInterval(() => this.loadUnreadCount(), 30000);
  }

  ngOnDestroy() {
    if (this.notifPolling) clearInterval(this.notifPolling);
  }

  get currentLang(): Lang {
    return this.languageService.getCurrent();
  }

  setLang(lang: Lang): void {
    this.languageService.use(lang);
  }

  toggleLang(): void {
    this.languageService.toggle();
  }
  get displayName(): string {
    if (this.clientName) return this.clientName;
    const login = this.userLogin || '';
    const atIdx = login.indexOf('@');
    return atIdx > 0 ? login.substring(0, atIdx) : (login || 'Utilisateur');
  }

  logout() {

    this.authService.logout();

    this.router.navigate(['/']);

  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isDark(): boolean {
    return this.themeService.isDark();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  loadUnreadCount() {
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => this.unreadCount = res.count,
      error: () => {}
    });
  }

  toggleNotifDropdown() {
    this.showNotifDropdown = !this.showNotifDropdown;

    if (this.showNotifDropdown) {
      this.notificationService.getAll().subscribe({
        next: (data) => this.notifications = data,
        error: () => {}
      });
    }
  }

  onNotificationClick(notif: any) {
    if (!notif.lu) {
      this.notificationService.markAsRead(notif.id).subscribe({
        next: () => {
          notif.lu = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        },
        error: () => {}
      });
    }

    this.showNotifDropdown = false;

    if (notif.link) {
      this.router.navigateByUrl(notif.link);
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.lu = true);
        this.unreadCount = 0;
      },
      error: () => {}
    });
  }

  timeAgo(date: string): string {
    const diffMs = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 1) return this.translate.instant('navbar.justNow');
    if (minutes < 60) return this.translate.instant('navbar.minutesAgo', { value: minutes });

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return this.translate.instant('navbar.hoursAgo', { value: hours });

    const days = Math.floor(hours / 24);
    return this.translate.instant('navbar.daysAgo', { value: days });
  }

}
