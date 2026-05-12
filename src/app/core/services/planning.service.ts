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

}
