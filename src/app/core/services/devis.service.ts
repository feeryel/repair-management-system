import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DevisService {

  api = 'http://localhost:3000/devis';
  publicApi = 'https://bountiful-emphases-phantom.ngrok-free.dev/public/devis';

  constructor(private http: HttpClient) {}

  getByReparation(reparationId: number) {
    return this.http.get(`${this.api}/reparation/${reparationId}`);
  }

  create(reparationId: number) {
    return this.http.post(`${this.api}/reparation/${reparationId}`, {});
  }

  getPublicByToken(token: string) {
    return this.http.get(`${this.publicApi}/${token}`);
  }

  respondPublic(token: string, action: 'accept' | 'reject', motif?: string) {
    return this.http.post(`${this.publicApi}/${token}/respond`, { action, motif });
  }
}
