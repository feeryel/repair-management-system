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

  create(data:any) {
    return this.http.post(this.api, data);
  }

  update(id:number, data:any) {
    return this.http.put(`${this.api}/${id}`, data);
  }

  delete(id:number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
