import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LigneReparationService {

  apiUrl =
  'http://localhost:3000/lignereparations';

  constructor(private http:HttpClient) {}

  getAll(){

    return this.http.get(this.apiUrl);

  }

  getByReparation(id:any){

    return this.http.get(
      `${this.apiUrl}/reparation/${id}`
    );

  }

  create(data:any){

    return this.http.post(
      this.apiUrl,
      data
    );

  }

  delete(id:any){

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );

  }
}
