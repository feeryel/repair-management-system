import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../models/client';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {

  clients: Client[] = [];

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadClients();
  }

 loadClients() {

  this.clientService.getClients().subscribe({

    next: (data) => {

      console.log("CLIENTS:", data);

      this.clients = data;

    },

    error: (err) => {

      console.log(err);

    }

  });

}

deleteClient(id:number){

  if(confirm("Supprimer client ?")){

    this.clientService.deleteClient(id).subscribe({
      next:()=>{

        this.loadClients();

      },
      error:(err)=>{
        console.log(err);
      }
    });

  }
}
}
