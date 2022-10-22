import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';

@Injectable({ providedIn: 'root' })

export class GridViewService {

  selectedView: string;
  gridSubtitle: string;
  monthlyCurrentDate: Date;
  treasuryLogsForDetails: ITreasuryLog[];
  titleForDetails: string;
  source:string;

  constructor(private _router:Router) {
    this.monthlyCurrentDate = new Date();
    this.selectedView = 'anual';
    this.gridSubtitle = '';
    this.gridSubtitleGenerator();
  }

  getMonthDays(year: number, month: number): number {
    return new Date(year, month+1, 0).getDate();
  };

  swapGridView(view:string) :void {
    this.selectedView = view;
    this.gridSubtitleGenerator();
    this._router.navigateByUrl(`/fi/grid/${view}`)
  }

  gridSubtitleGenerator(): void {
    switch (this.selectedView) {
      case 'month': this.gridSubtitle = 'Vista mensal'; break;
      case 'anual': this.gridSubtitle = 'Vista anual'; break;
      case 'decade': this.gridSubtitle = 'Vista década'; break;
    }
  }

}
