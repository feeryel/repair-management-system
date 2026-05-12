import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AppareilService } from '../../../core/services/appareil.service';

@Component({
  selector: 'app-appareil-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './appareil-form.component.html'
})
export class AppareilFormComponent implements OnInit {

  appareil:any = {
    marque:'',
    modele:'',
    numSerie:'',
    type:'',
    ClientId:''
  };

  id:any;

  constructor(
    private service:AppareilService,
    private router:Router,
    private route:ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.id = this.route.snapshot.paramMap.get('id');

    if(this.id){

      this.service.getOne(this.id).subscribe({
        next:(res:any)=>{
          this.appareil = res;
        }
      });

    }

  }

  save(){

    if(this.id){

      this.service.update(this.id,this.appareil).subscribe({
        next:()=>{
          alert('Appareil modifié');
          this.router.navigate(['/appareils']);
        }
      });

    }

    else{

      this.service.add(this.appareil).subscribe({
        next:()=>{
          alert('Appareil ajouté');
          this.router.navigate(['/appareils']);
        }
      });

    }

  }

}
