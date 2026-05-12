import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [FormsModule],
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

    // UPDATE
    if(this.id){

      this.clientService.update(this.id, this.client).subscribe({

        next:()=>{

          alert('Client modifié');

          this.router.navigate(['/clients']);

        },

        error:(err)=>{
          console.log(err);
        }

      });

    }

    // ADD
    else{

      this.clientService.addClient(this.client).subscribe({

        next: () => {

          alert('Client ajouté');

          this.router.navigate(['/clients']);
        },

        error: (err) => {
          console.log(err);
        }

      });

    }

  }

}
