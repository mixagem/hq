import { Injectable } from '@angular/core';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';

@Injectable({ providedIn: 'root' })

export class GridViewService {

  selectedView: string;
  gridSubtitle: string;
  monthlyCurrentDate: Date;

  treasuryLogsForDetails: ITreasuryLog[];
  titleForDetails: string;
  source:string;;


  constructor() {
    this.monthlyCurrentDate = new Date();
    this.selectedView = 'month';
    this.gridSubtitle = '';
    this.gridSubtitleGenerator();
  }

  getMonthDays(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  };

  gridSubtitleGenerator(): void {
    switch (this.selectedView) {
      case 'month': this.gridSubtitle = 'Vista mensal'; break;
      case 'anual': this.gridSubtitle = 'Vista anual'; break;
      case 'decade': this.gridSubtitle = 'Vista década'; break;

    }
  }

}
