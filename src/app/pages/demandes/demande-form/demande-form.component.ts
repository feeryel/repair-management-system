import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { DemandeService } from '../../../core/services/demande.service';

@Component({
  selector: 'app-demande-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './demande-form.component.html',
  styleUrls: ['./demande-form.component.scss']
})
export class DemandeFormComponent {


  demande:any = {

    dateDepot:'',
    datePrevueRep:'',
    symptomesPanne:'',
    etat:'En attente',
    idEtiquette:'',
    AppareilId:''

  };
  id:any;

  constructor(

    private demandeService: DemandeService,

    private router: Router,
      private route:ActivatedRoute


  ) {}
 ngOnInit(): void {

    this.id = this.route.snapshot.paramMap.get('id');

    if(this.id){

      this.demandeService.getOne(this.id).subscribe({
        next:(res:any)=>{
          this.demande = res;
        }
      });

    }

  }
  save(){

    if(this.id){

      this.demandeService.update(this.id,this.demande).subscribe({
        next:()=>{

          alert('Demande modifiée');

          this.router.navigate(['/demandes']);

        }
      });

    }

    else{

      this.demandeService.add(this.demande).subscribe({
        next:()=>{

          alert('Demande ajoutée');

          this.router.navigate(['/demandes']);

        }
      });

    }

  }

}
