import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post<any>(
      `${this.apiUrl}/login`,
      data
    );
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.clear();
  }
getRole(): string | null {
  return localStorage.getItem('role');
}

isAdmin(): boolean {
  return this.getRole() === 'ADMIN';
}

isTechnicien(): boolean {
  return this.getRole() === 'TECHNICIEN';
}

isClient(): boolean {
  return this.getRole() === 'CLIENT';
}

isResponsableAchatStock(): boolean {
  return this.getRole() === 'RESPONSABLE_ACHAT_STOCK';
}

isResponsableReparation(): boolean {
  return this.getRole() === 'RESPONSABLE_REPARATION';
}

isResponsableReception(): boolean {
  return this.getRole() === 'RESPONSABLE_RECEPTION';
}
}
