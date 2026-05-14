import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

import { AppareilService } from '../../../core/services/appareil.service';

@Component({
  selector: 'app-appareil-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './appareil-form.component.html',
  styleUrls: ['./appareil-form.component.scss']
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

    // UPDATE
    if(this.id){

      this.service.update(this.id,this.appareil).subscribe({

        next:()=>{

          Swal.fire({

            icon: 'success',
            title: 'Appareil modifié',
            text: 'Modification effectuée avec succès',

            confirmButtonColor: '#667eea'

          });

          this.router.navigate(['/appareils']);

        },

        error:(err)=>{

          console.log(err);

          Swal.fire({

            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue',

            confirmButtonColor: '#dc3545'

          });

        }

      });

    }

    // ADD
    else{

      this.service.add(this.appareil).subscribe({

        next:()=>{

          Swal.fire({

            icon: 'success',
            title: 'Appareil ajouté',
            text: 'Ajout effectué avec succès',

            confirmButtonColor: '#667eea'

          });

          this.router.navigate(['/appareils']);

        },

        error:(err)=>{

          console.log(err);

          Swal.fire({

            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue',

            confirmButtonColor: '#dc3545'

          });

        }

      });

    }

  }

}
