export interface Facture {

  id?: number;

  numero: string;

  date: Date;

  montantHT: number;

  montantTVA: number;

  timbreFiscale: number;

  montantTotal: number;

}
