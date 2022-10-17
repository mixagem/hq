import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })

export class GridViewService {

  selectedView: string;

  constructor() {
    this.selectedView = 'month';
  }

  getMonthDays(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  };

}
