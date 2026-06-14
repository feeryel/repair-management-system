import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));

      if (isNaN(id)) {
        this.loading = false;
        this.error = 'Identifiant de garantie invalide.';
        return;
      }

      const headers = new HttpHeaders({ 'ngrok-skip-browser-warning': 'true' });

      this.http.get<any>(`${this.apiUrl}/public/garantie/${id}`, { headers }).subscribe({
        next: (res) => {
          this.facture = res;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.error = 'Certificat de garantie introuvable.';
        }
      });
    });
  }

  // ── Accès aux données imbriquées (Reparation → Demande → Appareil → Client) ──

  get reparation(): any {
    return this.facture?.Reparation;
  }

  get demande(): any {
    return this.reparation?.Demande ?? this.reparation?.DemandeReparation;
  }

  get appareil(): any {
    return this.demande?.Appareil;
  }

  get client(): any {
    return this.appareil?.Client;
  }

  get lignes(): any[] {
    return this.reparation?.LigneReparations ?? [];
  }

  // Garantie valide ou non
  isValidGarantie(): boolean {
    if (!this.facture?.date) return false;

    const start = new Date(this.facture.date);
    const end = new Date(start);
    end.setDate(end.getDate() + 30);

    return new Date() <= end;
  }

  // Date de fin de garantie
  getDateFinGarantie(date: string): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + 30);
    return d;
  }

  // Jours restants
  getJoursRestants(date: string): number {
    const start = new Date(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 30);

    const diff = end.getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 0;
  }
}
