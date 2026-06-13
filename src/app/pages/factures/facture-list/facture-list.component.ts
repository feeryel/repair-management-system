import { Component, OnInit } from '@angular/core';
import { FactureService } from '../../../core/services/facture.service';
import { AuthService, Role } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

@Component({
  selector: 'app-facture-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './facture-list.component.html',
  styleUrls: ['./facture-list.component.css']
})
export class FactureListComponent implements OnInit {
role: Role | '' = '';
isClient = false;
  factures: any[] = [];
  searchText: string = '';

  constructor(private service: FactureService, private authService: AuthService) {}

 ngOnInit(): void {
  this.role = (this.authService.getRole() as Role) ?? '';
  this.isClient = this.role === Role.CLIENT;

  this.loadData();
}

  loadData() {
    const role = this.authService.getRole();

    if (role === Role.CLIENT) {
      const clientId = this.authService.getClientId();
      if (clientId) {
        this.service.getByClientId(clientId).subscribe({
          next: (res: any) => this.factures = res,
          error: (err) => console.error(err)
        });
      }
    } else {
      this.service.getAll().subscribe({
        next: (res: any) => this.factures = res,
        error: (err) => console.error(err)
      });
    }
  }
get validFactures(): any[] {
  return this.factures.filter(f => this.isValidFacture(f));
}

getTotal(): number {
  return this.validFactures.reduce((sum, f) => {
    return sum + (Number(f.montantTotal) || 0);
  }, 0);
}
async getBase64ImageFromURL(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
  filteredFactures() {
    const base = this.validFactures;

    if (!this.searchText) return base;

    return base.filter(f =>
      f.id?.toString().includes(this.searchText) ||
      f.ReparationId?.toString().includes(this.searchText)
    );
  }

  isValidFacture(f: any): boolean {
    return f?.Reparation?.status === 'DONE' && f?.Reparation?.estReparable === true;
  }

  /* ================= PDF ================= */
 async exportPDF(facture: any) {
  const rep = facture?.Reparation;
  const demande = rep?.Demande || rep?.DemandeReparation;
  const appareil = demande?.Appareil;
  const client = appareil?.Client;
const logo = await this.getBase64ImageFromURL('assets/techdoctor_cachet.png');
  const lignes = rep?.LigneReparations || [];

  const doc = new jsPDF();

  /* ================= HEADER ================= */
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, 220, 35, 'F');

  doc.setTextColor(255);
  doc.setFontSize(18);
  doc.text('FACTURE DE RÉPARATION', 14, 22);

  doc.setTextColor(0);
  doc.setFontSize(11);

  doc.text(`Facture ID: ${facture.id}`, 14, 45);
  doc.text(`Date: ${new Date(facture.date).toLocaleDateString()}`, 14, 52);

  /* ================= REPARATION ================= */
  autoTable(doc, {
    startY: 65,
    head: [['Réparation', 'Détails']],
    body: [
      ['Description', rep?.descriptionReparation || '-'],
      ['Statut', rep?.status || '-'],
      ['Temps MO', `${rep?.tempsMainOeuvre || 0} h`],
      ['Réparable', rep?.estReparable ? 'Oui' : 'Non']
    ]
  });

  /* ================= CLIENT ================= */
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Client', 'Info']],
    body: [
      ['Nom', client?.nom || '-'],
      ['Téléphone', client?.numTel || '-'],
      ['Email', client?.email || '-'],
      ['Appareil', appareil ? `${appareil.marque} ${appareil.modele}` : '-'],
      ['Num Série', appareil?.numSerie || '-']
    ]
  });

  /* ================= PIECES ================= */
  if (lignes.length > 0) {
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Pièce', 'Code', 'Prix HT', 'Quantité']],
      body: lignes.map((l: any) => [
        l.Piece?.nom || '-',
        l.Piece?.code || '-',
        `${l.Piece?.prixHT || 0} TND`,
        l.quantite || 1
      ])
    });
  }

const y = (doc as any).lastAutoTable.finalY + 10;

/* ================= TOTAL ================= */
doc.setFillColor(220, 252, 231);
doc.rect(14, y, 180, 15, 'F');

doc.setFontSize(14);
doc.setTextColor(22, 101, 52);
doc.setFont('helvetica', 'bold');

doc.text(`TOTAL: ${facture?.montantTotal || 0} TND`, 20, y + 10);

/* ================= SIGNATURES ================= */
 doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');

  doc.rect(14, y + 25, 80, 35);
  doc.text('Signature Client', 16, y + 33);

  doc.rect(120, y + 25, 80, 35);
  doc.text('Signature Société', 122, y + 33);

  /* ================= LOGO ================= */


doc.addImage(logo, 'PNG', 133, y + 35, 50, 18);

/* ================= QR CODE ================= */
const qrData = `https://regal-cobbler-e2516a.netlify.app/public/garantie/${facture?.id}`;
const qr = await QRCode.toDataURL(qrData);

doc.addImage(qr, 'PNG', 150, y + 65, 40, 40);

doc.setFontSize(9);
doc.setTextColor(120);

doc.text(
  'pour voir la garantie il faut scanner le code QR\nTECHDOCTOR - Tunisie | contact@techdoctor.tn',
  8,
  285
);

/* ================= SAVE ================= */
doc.save(`facture-${facture?.id}.pdf`);}
}
