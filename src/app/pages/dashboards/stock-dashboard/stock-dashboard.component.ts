import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PieceService } from '../../../core/services/piece.service';

@Component({
  selector: 'app-stock-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './stock-dashboard.component.html'
})
export class StockDashboardComponent implements OnInit {
  login        = '';
  totalPieces  = 0;
  stockFaible  = 0;
  stockOk      = 0;
  valeurStock  = 0;
  pieces: any[] = [];

  constructor(
    private authService: AuthService,
    private pieceService: PieceService
  ) {}

  ngOnInit(): void {
    this.login = this.authService.getUserLogin() ?? 'Responsable Stock';
    this.pieceService.getAll().subscribe({
      next: (r: any) => {
        this.pieces     = r;
        this.totalPieces= r.length;
        this.stockFaible= r.filter((p: any) => (p.quantiteEnStock ?? 0) < 5).length;
        this.stockOk    = this.totalPieces - this.stockFaible;
        this.valeurStock= r.reduce((acc: number, p: any) => acc + (p.prixAchat ?? 0) * (p.quantiteEnStock ?? 0), 0);
      }
    });
  }

  stockClass(qty: number): string {
    if (qty === 0) return 'stock-zero';
    if (qty < 5)  return 'stock-low';
    return 'stock-ok';
  }
  stockLabel(qty: number): string {
    if (qty === 0) return 'Rupture';
    if (qty < 5)  return 'Faible';
    return 'Disponible';
  }
}
