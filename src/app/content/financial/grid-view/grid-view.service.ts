import { Injectable } from '@angular/core';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';

@Injectable({ providedIn: 'root' })

export class GridViewService {

  selectedView: string;
  gridSubtitle: string;
  monthlyCurrentDate: Date;
  treasuryLogsForDetails: ITreasuryLog[];
  titleForDetails: string;
  source: string;

  constructor() {
    this.monthlyCurrentDate = new Date();
    this.gridSubtitle = '';
    this.selectedView = 'anual';
  }

  getMonthDays(year: number, month: number): number { return new Date(year, month + 1, 0).getDate(); };


}
