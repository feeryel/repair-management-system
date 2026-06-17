import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuditLogService } from '../../../core/services/audit-log.service';

@Component({
  selector: 'app-audit-log-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './audit-log-list.component.html'
})
export class AuditLogListComponent implements OnInit {

  logs: any[] = [];
  loading = false;

  total = 0;
  totalPages = 1;
  currentPage = 1;
  pageSize = 20;

  filterEntity   = '';
  filterDateFrom = '';
  filterDateTo   = '';

  entities = [
    { value: 'Reparation', labelKey: 'auditLog.entityReparation' },
    { value: 'Demande',    labelKey: 'auditLog.entityDemande' },
    { value: 'Client',     labelKey: 'auditLog.entityClient' },
    { value: 'Planning',   labelKey: 'auditLog.entityPlanning' },
    { value: 'User',       labelKey: 'auditLog.entityUser' },
    { value: 'Devis',      labelKey: 'auditLog.entityDevis' },
  ];

  constructor(private auditLogService: AuditLogService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.auditLogService.getAll({
      entity:   this.filterEntity   || undefined,
      dateFrom: this.filterDateFrom || undefined,
      dateTo:   this.filterDateTo   || undefined,
      page: this.currentPage,
      limit: this.pageSize
    }).subscribe({
      next: (r) => {
        this.logs       = r.data;
        this.total      = r.total;
        this.totalPages = r.totalPages || 1;
        this.loading    = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.load();
  }

  resetFilters(): void {
    this.filterEntity   = '';
    this.filterDateFrom = '';
    this.filterDateTo   = '';
    this.currentPage    = 1;
    this.load();
  }

  get hasActiveFilters(): boolean {
    return !!(this.filterEntity || this.filterDateFrom || this.filterDateTo);
  }

  goTo(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.load();
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const cur   = this.currentPage;
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, cur - delta); i <= Math.min(total, cur + delta); i++) range.push(i);
    return range;
  }

  actionClass(action: string): string {
    const m: Record<string, string> = {
      CREATE: 'act-create',
      UPDATE: 'act-update',
      DELETE: 'act-delete',
      STATUS_CHANGE: 'act-status'
    };
    return m[action] ?? 'act-default';
  }

  actionIcon(action: string): string {
    const m: Record<string, string> = {
      CREATE: 'bi-plus-circle-fill',
      UPDATE: 'bi-pencil-square',
      DELETE: 'bi-trash-fill',
      STATUS_CHANGE: 'bi-arrow-repeat'
    };
    return m[action] ?? 'bi-circle-fill';
  }

  entityIcon(entity: string): string {
    const m: Record<string, string> = {
      Reparation: 'bi-tools',
      Demande:    'bi-clipboard-check-fill',
      Client:     'bi-person-fill',
      Planning:   'bi-calendar-event',
      User:       'bi-people-fill',
      Devis:      'bi-receipt'
    };
    return m[entity] ?? 'bi-archive-fill';
  }

  formatDetails(details: any): string {
    if (!details) return '—';
    let obj = details;
    if (typeof details === 'string') {
      try { obj = JSON.parse(details); } catch { return details; }
    }
    if (typeof obj !== 'object') return String(obj);
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join(', ');
  }
}
