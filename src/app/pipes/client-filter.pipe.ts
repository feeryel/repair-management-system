import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'clientFilter',
  standalone: true
})
export class ClientFilterPipe implements PipeTransform {

  transform(clients: any[], search: string): any[] {

    if (!clients) return [];
    if (!search) return clients;

    search = search.toLowerCase();

    return clients.filter(c =>
      c.nom?.toLowerCase().includes(search) ||
      c.email?.toLowerCase().includes(search) ||
      c.numTel?.toString().includes(search)
    );
  }
}
