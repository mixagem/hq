import { Injectable } from '@angular/core';
import { EFaturaEnum } from 'src/assets/interfaces/efatura';

export type ze = {

}


@Injectable({
  providedIn: 'root'
})

export class EfaturaService {

  efaturaEnum: any;

  constructor() {
    this.efaturaEnum = {...EFaturaEnum}
  }
}
