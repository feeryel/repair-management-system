import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppareilService {

  apiUrl = 'http://localhost:3000/appareils';

  constructor(private http: HttpClient) {}

  getAll(){
    return this.http.get(this.apiUrl);
  }

  getOne(id:any){
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  add(data:any){
    return this.http.post(this.apiUrl,data);
  }

  update(id:any,data:any){
    return this.http.put(`${this.apiUrl}/${id}`,data);
  }

  delete(id:any){
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
