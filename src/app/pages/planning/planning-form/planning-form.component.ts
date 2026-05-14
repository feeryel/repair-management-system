import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { PlanningService } from '../../../core/services/planning.service';

@Component({
  selector:'app-planning-form',
  standalone:true,
  imports:[FormsModule],
  templateUrl:'./planning-form.component.html'
})
export class PlanningFormComponent implements OnInit {

  planning:any = {

    dateDebut:'',
    dateFin:'',
    responsableId:'',
    DemandeReparationId:''

  };

  id:any;

  constructor(
    private service:PlanningService,
    private router:Router,
    private route:ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.id = this.route.snapshot.paramMap.get('id');

    if(this.id){

      this.service.getOne(this.id).subscribe({
        next:(res:any)=>{
          this.planning = res;
        }
      });

    }

  }

  save(){

    if(this.id){

      this.service.update(this.id,this.planning).subscribe({
        next:()=>{

          alert('Planning modifié');

          this.router.navigate(['/planning']);

        }
      });

    }

    else{

      this.service.create(this.planning).subscribe({
        next:()=>{

          alert('Planning ajouté');

          this.router.navigate(['/planning']);

        }
      });

    }

  }

}
