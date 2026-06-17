import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PieceService } from '../../../core/services/piece.service';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-piece-form',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, TranslateModule],
  templateUrl: './piece-form.component.html',
  styleUrls: ['./piece-form.component.css']
})
export class PieceFormComponent implements OnInit {

  id:any;
  saving = false;

  formData = {

    code: '',
    nom: '',
    prixAchat: 0,
    prixHT: 0,
    quantiteEnStock: 0

  };

  constructor(
    private service:PieceService,
    private router:Router,
    private route:ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {

    this.id = this.route.snapshot.paramMap.get('id');

    if(this.id){

      this.service.getOne(this.id).subscribe({

        next:(res:any)=>{

          this.formData = res;

        }

      });

    }
  }

  get marge(): number {
    return (this.formData.prixHT || 0) - (this.formData.prixAchat || 0);
  }

  get margePercent(): number {
    return this.formData.prixAchat > 0 ? (this.marge / this.formData.prixAchat) * 100 : 0;
  }

  save(form: any){

    if (form.invalid) {
      Object.keys(form.controls).forEach(k => form.controls[k].markAsTouched());
      Swal.fire(
        this.translate.instant('pieceForm.invalidTitle'),
        this.translate.instant('pieceForm.invalidText'),
        'warning'
      );
      return;
    }

    this.saving = true;

    const req = this.id
      ? this.service.update(this.id, this.formData)
      : this.service.add(this.formData);

    req.subscribe({

      next:()=>{

        this.saving = false;

        Swal.fire({
          icon: 'success',
          title: this.translate.instant('pieceForm.successTitle'),
          text: this.id
            ? this.translate.instant('pieceForm.updated')
            : this.translate.instant('pieceForm.added'),
          timer: 1500,
          showConfirmButton: false
        });

        this.router.navigate(['/pieces']);

      },

      error:()=>{

        this.saving = false;

        Swal.fire(
          this.translate.instant('pieceForm.errorTitle'),
          this.translate.instant('pieceForm.errorText'),
          'error'
        );

      }

    });
  }
}
