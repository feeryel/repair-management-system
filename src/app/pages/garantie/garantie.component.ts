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
            console.log('FACTURE =>', res);
          },
          error: (err) => console.error('Erreur chargement garantie:', err)
        });
      }
    });
  }

  // 🔥 Garantie valide ou non
  isValidGarantie(): boolean {
    if (!this.facture?.date) return false;

    const start = new Date(this.facture.date);
    const end = new Date(start);
    end.setDate(end.getDate() + 30);

    return new Date() <= end;
  }

  // 📅 date fin garantie
  getDateFinGarantie(date: string): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + 30);
    return d;
  }

  // ⏳ jours restants
  getJoursRestants(date: string): number {
    const start = new Date(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 30);

    const diff = end.getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 0;
  }
}
