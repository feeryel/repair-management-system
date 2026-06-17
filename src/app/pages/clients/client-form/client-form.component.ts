import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {

  client:any = {
    nom: '',
    adresse: '',
    numTel: '',
    email: ''
  };

  id:any;
villes: string[] = [

  'Tunis',
  'Ariana',
  'Ben Arous',
  'Manouba',
  'Nabeul',
  'Zaghouan',
  'Bizerte',
  'Béja',
  'Jendouba',
  'Le Kef',
  'Siliana',
  'Sousse',
  'Monastir',
  'Mahdia',
  'Sfax',
  'Kairouan',
  'Kasserine',
  'Sidi Bouzid',
  'Gabès',
  'Médenine',
  'Tataouine',
  'Gafsa',
  'Tozeur',
  'Kébili'

];
  constructor(
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {

    this.id = this.route.snapshot.paramMap.get('id');

    // MODE UPDATE
    if(this.id){

      this.clientService.getClientById(this.id).subscribe({

        next:(res:any)=>{

          this.client = res;

        },

        error:(err)=>{

          console.log(err);

        }

      });

    }

  }

  saveClient() {

    // VALIDATION
    if(
      !this.client.nom ||
      !this.client.adresse ||
      !this.client.numTel ||
      !this.client.email
    ){

      Swal.fire({

        icon: 'warning',
        title: this.translate.instant('clientForm.alerts.missingFieldsTitle'),
        text: this.translate.instant('clientForm.alerts.missingFieldsText'),

        confirmButtonColor: '#667eea'

      });

      return;

    }

    // VALIDATION NOM
    if(this.client.nom.length < 3){

      Swal.fire({

        icon: 'warning',
        title: this.translate.instant('clientForm.alerts.invalidNameTitle'),
        text: this.translate.instant('clientForm.alerts.invalidNameText'),

        confirmButtonColor: '#667eea'

      });

      return;

    }

    // VALIDATION TEL
    const telRegex = /^[9254][0-9]{7}$/;

    if(!telRegex.test(this.client.numTel)){

      Swal.fire({

        icon: 'warning',
        title: this.translate.instant('clientForm.alerts.invalidPhoneTitle'),
        text: this.translate.instant('clientForm.alerts.invalidPhoneText'),

        confirmButtonColor: '#667eea'

      });

      return;

    }

    // VALIDATION EMAIL
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(this.client.email)){

      Swal.fire({

        icon: 'warning',
        title: this.translate.instant('clientForm.alerts.invalidEmailTitle'),
        text: this.translate.instant('clientForm.alerts.invalidEmailText'),

        confirmButtonColor: '#667eea'

      });

      return;

    }

    // UPDATE
    if(this.id){

      this.clientService.update(this.id, this.client).subscribe({

        next:()=>{

          Swal.fire({

            icon: 'success',
            title: this.translate.instant('clientForm.alerts.updatedTitle'),
            text: this.translate.instant('clientForm.alerts.updatedText'),

            confirmButtonColor: '#667eea'

          });

          this.router.navigate(['/clients']);

        },

        error:(err)=>{

          console.log(err);

          Swal.fire({

            icon: 'error',
            title: this.translate.instant('clientForm.alerts.errorTitle'),
            text: this.translate.instant('clientForm.alerts.errorText'),

            confirmButtonColor: '#dc3545'

          });

        }

      });

    }

    // ADD
    else{

      this.clientService.addClient(this.client).subscribe({

        next:()=>{

          Swal.fire({

            icon: 'success',
            title: this.translate.instant('clientForm.alerts.addedTitle'),
            text: this.translate.instant('clientForm.alerts.addedText'),

            confirmButtonColor: '#667eea'

          });

          this.router.navigate(['/clients']);

        },

        error:(err)=>{

          console.log(err);

          Swal.fire({

            icon: 'error',
            title: this.translate.instant('clientForm.alerts.errorTitle'),
            text: this.translate.instant('clientForm.alerts.errorText'),

            confirmButtonColor: '#dc3545'

          });

        }

      });

    }

  }

}
