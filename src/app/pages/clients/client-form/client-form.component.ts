import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
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
    private route: ActivatedRoute
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
        title: 'Champs manquants',
        text: 'Veuillez remplir tous les champs',

        confirmButtonColor: '#667eea'

      });

      return;

    }

    // VALIDATION NOM
    if(this.client.nom.length < 3){

      Swal.fire({

        icon: 'warning',
        title: 'Nom invalide',
        text: 'Le nom doit contenir au moins 3 caractères',

        confirmButtonColor: '#667eea'

      });

      return;

    }

    // VALIDATION TEL
    const telRegex = /^[0-9]{8}$/;

    if(!telRegex.test(this.client.numTel)){

      Swal.fire({

        icon: 'warning',
        title: 'Téléphone invalide',
        text: 'Le numéro doit contenir 8 chiffres',

        confirmButtonColor: '#667eea'

      });

      return;

    }

    // VALIDATION EMAIL
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(this.client.email)){

      Swal.fire({

        icon: 'warning',
        title: 'Email invalide',
        text: 'Veuillez entrer un email valide',

        confirmButtonColor: '#667eea'

      });

      return;

    }

    // VALIDATION ADRESSE
    if(this.client.adresse.length < 5){

      Swal.fire({

        icon: 'warning',
        title: 'Adresse invalide',
        text: 'Adresse trop courte',

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
            title: 'Client modifié',
            text: 'Modification effectuée avec succès',

            confirmButtonColor: '#667eea'

          });

          this.router.navigate(['/clients']);

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

      this.clientService.addClient(this.client).subscribe({

        next:()=>{

          Swal.fire({

            icon: 'success',
            title: 'Client ajouté',
            text: 'Ajout effectué avec succès',

            confirmButtonColor: '#667eea'

          });

          this.router.navigate(['/clients']);

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
