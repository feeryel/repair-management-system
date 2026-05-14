import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PieceService {

  apiUrl = 'http://localhost:3000/pieces';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get(this.apiUrl);
  }

  add(data: any) {
    return this.http.post(this.apiUrl, data);
  }
 getOne(id:any) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
update(id:any,data:any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
