import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppareilService } from '../../../core/services/appareil.service';

@Component({
  selector: 'app-appareil-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './appareil-list.component.html',
  styleUrls: ['./appareil-list.component.scss']
})
export class AppareilListComponent implements OnInit {

  appareils: any[] = [];

  searchText: string = '';

currentPage: number = 1;

itemsPerPage: number = 6;
selectedType: string = '';
sortOrder: string = '';

types: string[] = [
  'Smartphone',
  'Phone',
  'Laptop',
  'TV',
  'Imprimante',
  'Audio',
  'Caméra',
  'Smartwatch',
  'Console',
  'Autre'
];
  constructor(private appareilService: AppareilService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    this.appareilService.getAll().subscribe({

      next: (res: any) => {

        this.appareils = res;

      },

      error: (err) => {
        console.log(err);
      }

    });

  }
filteredAppareils() {

  let result = this.appareils.filter((a: any) => {

    const search = this.searchText.toLowerCase();

    const matchesSearch =
      a.marque?.toLowerCase().includes(search) ||
      a.modele?.toLowerCase().includes(search) ||
      a.type?.toLowerCase().includes(search) ||
      a.numSerie?.toLowerCase().includes(search);

    const matchesType =
      this.selectedType ? a.type === this.selectedType : true;

    return matchesSearch && matchesType;
  });

  // SORT
  if (this.sortOrder === 'asc') {
    result.sort((a, b) => a.modele.localeCompare(b.modele));
  }

  if (this.sortOrder === 'desc') {
    result.sort((a, b) => b.modele.localeCompare(a.modele));
  }

  return result;
}
paginatedAppareils() {

  const start =
    (this.currentPage - 1) * this.itemsPerPage;

  const end =
    start + this.itemsPerPage;

  return this.filteredAppareils().slice(start, end);

}

get totalPages(): number {

  return Math.ceil(
    this.filteredAppareils().length / this.itemsPerPage
  );

}

get pagesArray(): number[] {

  return Array(this.totalPages)
    .fill(0)
    .map((x, i) => i + 1);

}

goToPage(page:number){

  this.currentPage = page;

}

nextPage(){

  if(this.currentPage < this.totalPages){

    this.currentPage++;

  }

}

previousPage(){

  if(this.currentPage > 1){

    this.currentPage--;

  }

}
  delete(id: number) {

    if(confirm('Supprimer cet appareil ?')){

      this.appareilService.delete(id).subscribe({

        next: () => {

          this.loadData();

        },

        error:(err)=>{
          console.log(err);
        }

      });

    }

  }

}
