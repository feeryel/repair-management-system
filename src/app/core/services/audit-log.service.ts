import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface AuditLogFilters {
  entity?: string;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  total: number;
  page: number;
  totalPages: number;
  data: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {

  api = 'http://localhost:3000/admin/audit-logs';

  constructor(private http: HttpClient) {}

  getAll(filters: AuditLogFilters = {}) {
    const params: any = {
      page: filters.page ?? 1,
      limit: filters.limit ?? 20
    };
    if (filters.entity)   params.entity   = filters.entity;
    if (filters.userId)   params.userId   = filters.userId;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo)   params.dateTo   = filters.dateTo;

    return this.http.get<AuditLogResponse>(this.api, { params });
  }
}
