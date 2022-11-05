import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {

  treasuryNavbarInput : string

  constructor() {
    this.treasuryNavbarInput = '';
  }
}
