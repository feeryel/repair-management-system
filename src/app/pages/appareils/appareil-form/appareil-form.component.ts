import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AppareilService } from '../../../core/services/appareil.service';
import { ClientService } from '../../../core/services/client.service';

@Component({
  selector: 'app-appareil-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './appareil-form.component.html',
  styleUrls: ['./appareil-form.component.css']
})
export class AppareilFormComponent implements OnInit {

  appareil:any = {
    marque:'',
    modele:'',
    numSerie:'',
    type:'',
    clientId: null
  };

  clients:any[] = [];

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

  typeSelect: string = '';
  customType: string = '';

  id:any;

  constructor(
    private service:AppareilService,
    private clientService:ClientService,
    private router:Router,
    private route:ActivatedRoute,
    private translate:TranslateService
  ) {}

  ngOnInit(): void {

    this.id = this.route.snapshot.paramMap.get('id');

    this.clientService.getClients().subscribe({
      next:(res:any)=> this.clients = res ?? []
    });

    if(this.id){

      this.service.getOne(this.id).subscribe({
        next:(res:any)=>{
          this.appareil = res;
          this.appareil.clientId = res?.ClientId ?? res?.Client?.id ?? null;

          if (res?.type && this.types.includes(res.type)) {
            this.typeSelect = res.type;
          } else if (res?.type) {
            this.typeSelect = 'Autre';
            this.customType = res.type;
          }
        }
      });

    }

  }

  save(){

    this.appareil.type = this.typeSelect === 'Autre' ? this.customType : this.typeSelect;

    // UPDATE
    if(this.id){

      this.service.update(this.id,this.appareil).subscribe({

        next:()=>{

          Swal.fire({

            icon: 'success',
            title: this.translate.instant('appareilForm.alerts.updatedTitle'),
            text: this.translate.instant('appareilForm.alerts.updatedText'),

            confirmButtonColor: '#667eea'

          });

          this.router.navigate(['/appareils']);

        },

        error:(err)=>{

          console.log(err);

          Swal.fire({

            icon: 'error',
            title: this.translate.instant('appareilForm.alerts.errorTitle'),
            text: this.translate.instant('appareilForm.alerts.errorText'),

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
            title: this.translate.instant('appareilForm.alerts.addedTitle'),
            text: this.translate.instant('appareilForm.alerts.addedText'),

            confirmButtonColor: '#667eea'

          });

          this.router.navigate(['/appareils']);

        },

        error:(err)=>{

          console.log(err);

          Swal.fire({

            icon: 'error',
            title: this.translate.instant('appareilForm.alerts.errorTitle'),
            text: this.translate.instant('appareilForm.alerts.errorText'),

            confirmButtonColor: '#dc3545'

          });

        }

      });

    }

  }

}
