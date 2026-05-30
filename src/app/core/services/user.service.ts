import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {

  private api = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(this.api);
  }

  add(data: any) {
    return this.http.post(this.api, data);
  }

  desactiver(id: number) {
    return this.http.patch(`${this.api}/${id}/desactiver`, {});
  }

  reactiver(id: number) {
    return this.http.patch(`${this.api}/${id}/reactiver`, {});
  }

  bannir(id: number) {
    return this.http.patch(`${this.api}/${id}/bannir`, {});
  }

  getTechniciens() {
    return this.http.get<any[]>(`${this.api}/techniciens/list`);
  }
}
