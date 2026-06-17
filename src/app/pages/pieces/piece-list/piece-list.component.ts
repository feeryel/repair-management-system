import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PieceService } from '../../../core/services/piece.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-piece-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './piece-list.component.html',
  styleUrls: ['./piece-list.component.css']
})
export class PieceListComponent implements OnInit {

  pieces: any[] = [];

  // SEARCH + FILTER
  searchText: string = '';
  filterType: string = 'ALL';

  // PAGINATION
  currentPage: number = 1;
  itemsPerPage: number = 6;

  // STATS
  stockTotal = 0;
  piecesCritiques = 0;
  piecesOK = 0;
  ruptureStock = 0;

  constructor(private service: PieceService, private translate: TranslateService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.service.getAll().subscribe({
      next: (res: any) => {
        this.pieces = res || [];
        this.calculateStats();
        this.currentPage = 1;
      },
      error: (err) => console.log(err)
    });
  }

  // RESET PAGE
  resetPage(): void {
    this.currentPage = 1;
  }

  // STATS
  calculateStats(): void {

    this.stockTotal = 0;
    this.piecesCritiques = 0;
    this.piecesOK = 0;
    this.ruptureStock = 0;

    for (let p of this.pieces) {

      const stock = p.quantiteEnStock ?? 0;

      this.stockTotal += stock;

      if (stock === 0) this.ruptureStock++;
      else if (stock <= 5) this.piecesCritiques++;
      else this.piecesOK++;
    }
  }

  // FILTER + SEARCH
  get filteredPieces(): any[] {

    let data = [...this.pieces];

    // SEARCH
    if (this.searchText.trim()) {
      const s = this.searchText.toLowerCase();
      data = data.filter(p =>
        p.nom?.toLowerCase().includes(s)
      );
    }

    // FILTER
    if (this.filterType === 'CRITIQUE') {
      data = data.filter(p =>
        p.quantiteEnStock > 0 && p.quantiteEnStock <= 5
      );
    }

    if (this.filterType === 'OK') {
      data = data.filter(p => p.quantiteEnStock > 5);
    }

    if (this.filterType === 'RUPTURE') {
      data = data.filter(p => p.quantiteEnStock === 0);
    }

    return data;
  }

  // PAGINATION DATA
  get paginatedPieces(): any[] {

    const start =
      (this.currentPage - 1) * this.itemsPerPage;

    return this.filteredPieces.slice(
      start,
      start + this.itemsPerPage
    );
  }

  // TOTAL PAGES
  get totalPages(): number {
    return Math.ceil(
      this.filteredPieces.length / this.itemsPerPage
    );
  }

  // CHANGE PAGE
  changePage(page: number): void {

    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // DELETE
  delete(id: number): void {

    if (!confirm(this.translate.instant('pieceList.deleteConfirm'))) return;

    this.service.delete(id).subscribe({
      next: () => this.loadData(),
      error: (err) => console.log(err)
    });
  }
}
