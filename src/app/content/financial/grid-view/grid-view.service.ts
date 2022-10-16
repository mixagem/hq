import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })

export class GridViewService {

  selectedView: string;

  constructor() {
    this.selectedView = 'month';
  }

}



