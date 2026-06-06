import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface AdminStats {
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
  clients: {
    total: number;
  };
  reparations: {
    total: number;
    done: number;
    inProgress: number;
    pending: number;
    failed: number;
    monthly: number[];
    completionRate: number;
  };
  topTechs: { label: string; value: number }[];
  revenue: {
    total: number;
    totalFactures: number;
  };
}

@Injectable({ providedIn: 'root' })
export class AdminStatsService {
  private api = 'http://localhost:3000/admin';

  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.api}/stats`);
  }
}
