import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  apiUrl = 'http://localhost:3000/clients';

  constructor(private http: HttpClient) {}

  getClients() {
    return this.http.get<any[]>(this.apiUrl);
  }

  addClient(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  deleteClient(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
getClientById(id:any) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

update(id:any,data:any){
  return this.http.put(`${this.apiUrl}/${id}`,data);
}
}
