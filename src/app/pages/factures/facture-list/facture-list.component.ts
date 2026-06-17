import { Component, OnInit } from '@angular/core';
import { FactureService } from '../../../core/services/facture.service';
import { AuthService, Role } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

@Component({
  selector: 'app-facture-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './facture-list.component.html',
  styleUrls: ['./facture-list.component.css']
})
export class FactureListComponent implements OnInit {
role: Role | '' = '';
isClient = false;
  factures: any[] = [];
  searchText: string = '';

  constructor(private service: FactureService, private authService: AuthService, private translate: TranslateService) {}

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
  doc.text(this.translate.instant('factureList.pdf.title'), 14, 22);

  doc.setTextColor(0);
  doc.setFontSize(11);

  doc.text(`${this.translate.instant('factureList.pdf.factureId')}: ${facture.id}`, 14, 45);
  doc.text(`${this.translate.instant('common.date')}: ${new Date(facture.date).toLocaleDateString()}`, 14, 52);

  /* ================= REPARATION ================= */
  autoTable(doc, {
    startY: 65,
    head: [[this.translate.instant('factureList.pdf.reparation'), this.translate.instant('common.details')]],
    body: [
      [this.translate.instant('factureList.pdf.description'), rep?.descriptionReparation || '-'],
      [this.translate.instant('common.status'), rep?.status || '-'],
      [this.translate.instant('factureList.pdf.tempsMO'), `${rep?.tempsMainOeuvre || 0} h`],
      [this.translate.instant('factureList.pdf.reparable'), rep?.estReparable ? this.translate.instant('common.yes') : this.translate.instant('common.no')]
    ]
  });

  /* ================= CLIENT ================= */
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [[this.translate.instant('factureList.pdf.client'), this.translate.instant('factureList.pdf.info')]],
    body: [
      [this.translate.instant('common.name'), client?.nom || '-'],
      [this.translate.instant('factureList.pdf.phone'), client?.numTel || '-'],
      [this.translate.instant('factureList.pdf.email'), client?.email || '-'],
      [this.translate.instant('factureList.pdf.appareil'), appareil ? `${appareil.marque} ${appareil.modele}` : '-'],
      [this.translate.instant('factureList.pdf.numSerie'), appareil?.numSerie || '-']
    ]
  });

  /* ================= PIECES ================= */
  if (lignes.length > 0) {
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [[this.translate.instant('factureList.pdf.piece'), this.translate.instant('factureList.pdf.code'), this.translate.instant('factureList.pdf.prixHT'), this.translate.instant('factureList.pdf.quantite')]],
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

doc.text(`${this.translate.instant('factureList.pdf.total')}: ${facture?.montantTotal || 0} TND`, 20, y + 10);

/* ================= SIGNATURES ================= */
 doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');

  doc.rect(14, y + 25, 80, 35);
  doc.text(this.translate.instant('factureList.pdf.signatureClient'), 16, y + 33);

  doc.rect(120, y + 25, 80, 35);
  doc.text(this.translate.instant('factureList.pdf.signatureSociete'), 122, y + 33);

  /* ================= LOGO ================= */


doc.addImage(logo, 'PNG', 133, y + 35, 50, 18);

/* ================= QR CODE ================= */
const qrData = `https://regal-cobbler-e2516a.netlify.app/public/garantie/${facture?.id}`;
const qr = await QRCode.toDataURL(qrData);

doc.addImage(qr, 'PNG', 150, y + 65, 40, 40);

doc.setFontSize(9);
doc.setTextColor(120);

doc.text(
  this.translate.instant('factureList.pdf.qrHint'),
  8,
  285
);

/* ================= SAVE ================= */
doc.save(`facture-${facture?.id}.pdf`);}
}
