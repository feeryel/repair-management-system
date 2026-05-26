import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FactureService } from '../../core/services/facture.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-garantie',
    standalone: true,

    imports: [CommonModule],

  templateUrl: './garantie.component.html',
  styleUrls: ['./garantie.component.css']
})
export class GarantieComponent implements OnInit {

  facture: any;

  constructor(
    private route: ActivatedRoute,
    private service: FactureService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];

    this.service.getFactureById(id).subscribe(res => {
      this.facture = res;
    });
  }

  isValidGarantie(): boolean {
    return this.facture?.Reparation?.estReparable === true;
  }
}
