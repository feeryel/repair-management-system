import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReparationService {

  api = 'http://localhost:3000/reparations';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get(this.api);
  }

  getByClientId(clientId: number) {
    return this.http.get<any[]>(`${this.api}/client/${clientId}`);
  }

  getOne(id: number) {
    return this.http.get(`${this.api}/${id}`);
  }

  create(data: any) {
    return this.http.post(this.api, data);
  }

  update(id: number, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }

  updateStatus(id: number, status: string) {
    return this.http.patch(`${this.api}/${id}/status`, { status });
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

  // ✅ URL corrigée : /users/techniciens/list (était /utilisateurs/techniciens)
  getTechniciens() {
    return this.http.get<any[]>('http://localhost:3000/users/techniciens/list');
  }
}
