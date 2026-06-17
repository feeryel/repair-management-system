import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent implements OnInit {

  users: any[] = [];
  loading    = false;
  showForm   = false;
  errorMsg   = '';
  successMsg = '';

  newUser = { login: '', motDePasse: '', role: 'technicien' };

  roles = [
    { value: 'admin',                  labelKey: 'roles.ADMIN' },
    { value: 'technicien',             labelKey: 'roles.TECHNICIEN' },
    { value: 'reception',              labelKey: 'roles.RECEPTION' },
    { value: 'responsable_reparation', labelKey: 'roles.RESPONSABLE_REPARATION' },
    { value: 'achat_stock',            labelKey: 'roles.ACHAT_STOCK' },
  ];

  // ── Filters ──────────────────────────────────────────────────────
  filterLogin   = '';
  filterRole    = '';
  filterStatus  = '';        // '' | 'actif' | 'inactif' | 'banni'
  filterDateFrom = '';       // YYYY-MM-DD
  filterDateTo   = '';

  // ── Pagination ───────────────────────────────────────────────────
  pageSize    = 10;
  currentPage = 1;
  pageSizes   = [5, 10, 25, 50];

  constructor(private userService: UserService, private translate: TranslateService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (r) => {
        this.users = r.filter((u: any) => u.role !== 'admin');
        this.loading = false;
        this.currentPage = 1;
      },
      error: () => this.loading = false
    });
  }

  // ── Filtering ────────────────────────────────────────────────────

  get filteredUsers(): any[] {
    const login  = this.filterLogin.trim().toLowerCase();
    const from   = this.filterDateFrom ? new Date(this.filterDateFrom) : null;
    const to     = this.filterDateTo   ? new Date(this.filterDateTo + 'T23:59:59') : null;

    return this.users.filter(u => {
      if (login && !u.login?.toLowerCase().includes(login)) return false;
      if (this.filterRole && u.role !== this.filterRole) return false;

      if (this.filterStatus) {
        if (this.filterStatus === 'banni'   && !u.bannit)          return false;
        if (this.filterStatus === 'inactif' && (u.actif || u.bannit)) return false;
        if (this.filterStatus === 'actif'   && (!u.actif || u.bannit)) return false;
      }

      if (from || to) {
        const created = u.createdAt ? new Date(u.createdAt) : null;
        if (!created)          return false;
        if (from && created < from) return false;
        if (to   && created > to)   return false;
      }

      return true;
    });
  }

  get totalFiltered(): number { return this.filteredUsers.length; }

  get totalPages(): number { return Math.max(1, Math.ceil(this.totalFiltered / this.pageSize)); }

  get paginatedUsers(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const cur   = this.currentPage;
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, cur - delta); i <= Math.min(total, cur + delta); i++) range.push(i);
    return range;
  }

  goTo(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  onPageSizeChange(): void { this.currentPage = 1; }

  resetFilters(): void {
    this.filterLogin   = '';
    this.filterRole    = '';
    this.filterStatus  = '';
    this.filterDateFrom = '';
    this.filterDateTo   = '';
    this.currentPage   = 1;
  }

  get hasActiveFilters(): boolean {
    return !!(this.filterLogin || this.filterRole || this.filterStatus || this.filterDateFrom || this.filterDateTo);
  }

  // ── CRUD ─────────────────────────────────────────────────────────

  add(): void {
    this.errorMsg = '';
    if (!this.newUser.login.trim() || !this.newUser.motDePasse.trim()) {
      this.errorMsg = this.translate.instant('adminUsers.errLoginPwdRequired'); return;
    }
    this.userService.add(this.newUser).subscribe({
      next: (response: any) => {
        const emailPart = response.emailSent
          ? this.translate.instant('adminUsers.emailSent')
          : this.translate.instant('adminUsers.emailNotSent');
        this.successMsg = this.translate.instant('adminUsers.accountCreated', { value: this.newUser.login }) + ' ' + emailPart;
        this.showForm   = false;
        this.newUser    = { login: '', motDePasse: '', role: 'technicien' };
        this.load();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (e) => this.errorMsg = e.error?.message ?? this.translate.instant('adminUsers.errCreate')
    });
  }

  desactiver(u: any): void {
    if (!confirm(this.translate.instant('adminUsers.confirmDeactivate', { value: u.login }))) return;
    this.userService.desactiver(u.id).subscribe({
      next: () => { this.flash(this.translate.instant('adminUsers.accountDeactivated', { value: u.login })); this.load(); },
      error: (e) => this.flash(e.error?.message ?? this.translate.instant('adminUsers.error'), true)
    });
  }

  reactiver(u: any): void {
    this.userService.reactiver(u.id).subscribe({
      next: () => { this.flash(this.translate.instant('adminUsers.accountReactivated', { value: u.login })); this.load(); },
      error: (e) => this.flash(e.error?.message ?? this.translate.instant('adminUsers.error'), true)
    });
  }

  bannir(u: any): void {
    if (!confirm(this.translate.instant('adminUsers.confirmBan', { value: u.login }))) return;
    this.userService.bannir(u.id).subscribe({
      next: () => { this.flash(this.translate.instant('adminUsers.accountBanned', { value: u.login })); this.load(); },
      error: (e) => this.flash(e.error?.message ?? this.translate.instant('adminUsers.error'), true)
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────

  statusClass(u: any): string {
    if (u.bannit) return 'st-banni';
    if (!u.actif) return 'st-inactif';
    return 'st-actif';
  }

  statusLabel(u: any): string {
    if (u.bannit) return this.translate.instant('adminUsers.statusBanned');
    if (!u.actif) return this.translate.instant('adminUsers.statusInactive');
    return this.translate.instant('adminUsers.statusActive');
  }

  roleBadge(r: string): string {
    const m: Record<string, string> = {
      admin: 'badge-admin', client: 'badge-client', technicien: 'badge-tech',
      reception: 'badge-recep', responsable_reparation: 'badge-rep', achat_stock: 'badge-stock'
    };
    return m[r] ?? 'badge-default';
  }

  roleLabel(r: string): string {
    const key = this.roles.find(x => x.value === r)?.labelKey;
    return key ? this.translate.instant(key) : r;
  }

  private flash(msg: string, isError = false): void {
    if (isError) { this.errorMsg = msg; setTimeout(() => this.errorMsg = '', 4000); }
    else         { this.successMsg = msg; setTimeout(() => this.successMsg = '', 3000); }
  }
}
