import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlanningService {

  api = 'http://localhost:3000/planning';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get(this.api);
  }

  create(data:any) {
    return this.http.post(this.api, data);
  }
    getOne(id:any){
    return this.http.get(`${this.api}/${id}`);
  }

  getByTechnicien(technicienId:any){
    return this.http.get<any[]>(`${this.api}/technicien/${technicienId}`);
  }

  update(id:any,data:any){
    return this.http.put(`${this.api}/${id}`,data);
  }

  updateStatut(id:any, statut:string){
    return this.http.patch(`${this.api}/${id}/statut`, { statut });
  }

  delete(id:any){
    return this.http.delete(`${this.api}/${id}`);
  }
}
