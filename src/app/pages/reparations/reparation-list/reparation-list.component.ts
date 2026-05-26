import { Component, OnInit } from '@angular/core';
import { ReparationService } from '../../../core/services/reparation.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reparation-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reparation-list.component.html',
  styleUrls: ['./reparation-list.component.css']
})
export class ReparationListComponent implements OnInit {

  reparations: any[] = [];

  searchText: string = '';
  filter: string = 'all';

  currentPage: number = 1;
  itemsPerPage: number = 6;

  constructor(private service: ReparationService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.service.getAll().subscribe({
      next: (res: any) => {
        this.reparations = res;
      },
      error: (err) => console.log(err)
    });
  }

  setFilter(value: string) {
    this.filter = value;
    this.currentPage = 1;
  }

  get filteredReparations() {

    return this.reparations.filter(r => {

      const matchStatus =
        this.filter === 'all' || r.status === this.filter;

      const matchSearch =
        r.descriptionReparation?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        r.id?.toString().includes(this.searchText);

      return matchStatus && matchSearch;
    });

  }

  get paginatedReparations() {

    const start = (this.currentPage - 1) * this.itemsPerPage;

    return this.filteredReparations.slice(start, start + this.itemsPerPage);

  }

  get totalPages(): number {
    return Math.ceil(this.filteredReparations.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

}
