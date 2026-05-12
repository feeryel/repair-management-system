import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DemandeService {

  apiUrl = 'http://localhost:3000/demandes';

  constructor(private http: HttpClient) {}

getAll() {

  return this.http.get<any[]>(this.apiUrl);

}
 getOne(id:any){
    return this.http.get(`${this.apiUrl}/${id}`);
  }
   update(id:any,data:any){
    return this.http.put(`${this.apiUrl}/${id}`,data);
  }
  add(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
