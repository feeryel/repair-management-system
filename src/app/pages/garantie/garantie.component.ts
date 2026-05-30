import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-garantie',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './garantie.component.html',
  styleUrls: ['./garantie.component.css']
})
export class GarantieComponent implements OnInit {

  facture: any;
  apiUrl = 'https://bountiful-emphases-phantom.ngrok-free.dev';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!isNaN(id)) {
        this.http.get<any>(`${this.apiUrl}/public/garantie/${id}`).subscribe({
          next: (res) => {
            this.facture = res;
          },
          error: (err) => console.error('Erreur chargement garantie:', err)
        });
      }
    });
  }

  isValidGarantie(): boolean {
    return this.facture?.Reparation?.estReparable === true;
  }
}


