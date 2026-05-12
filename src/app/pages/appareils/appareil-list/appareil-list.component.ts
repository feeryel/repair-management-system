import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppareilService } from '../../../core/services/appareil.service';

@Component({
  selector: 'app-appareil-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './appareil-list.component.html',
  styleUrls: ['./appareil-list.component.scss']
})
export class AppareilListComponent implements OnInit {

  appareils: any[] = [];

  constructor(private appareilService: AppareilService) {}

  ngOnInit(): void {

    this.loadData();

  }

  loadData() {

    this.appareilService.getAll().subscribe({

      next: (res: any) => {

        this.appareils = res;

     },

      error:(err)=>{
        console.log(err);
      }

    });

  }
  delete(id: number) {
 if(confirm('Supprimer cet appareil ?')){

      this.appareilService.delete(id).subscribe({

        next:()=>{

          alert('Appareil supprimé');

          this.loadData();

        },

        error:(err)=>{
          console.log(err);
        }

      });

    }

  }

}
