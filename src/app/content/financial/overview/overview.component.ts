import { Component, OnInit } from '@angular/core';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { FinancialService } from '../financial.service';
import { TreasuryService } from '../treasury-log/treasury.service';



export type ItreasuryLogs = {
  date: Date,
  value: number,
  cat: number,
  subcat: number,
  type: string,
  obs?: string
}


@Component({
  selector: 'mhq-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})

export class OverviewComponent implements OnInit {

  tempArray: Array<any>;
  treasuryLogs: ITreasuryLog[];

  currentDate: Date
  selectedMonth: number;
  selectedMonthLocale: string;
  monthDays: number;
  selectedYear: number;

  constructor(public financialService: FinancialService, public treasuryService: TreasuryService) {
    this.currentDate = new Date();
  }

  ngOnInit(): void {
    this.selectedMonth = this.currentDate.getMonth() + 1
    switch (this.selectedMonth) {
      case 1: case 3: case 5: case 7: case 8: case 10: case 12:
        this.monthDays = 31;
        break;
      case 4: case 6: case 9: case 11:
        this.monthDays = 30;
        break;
      case 2:
        (this.currentDate.getFullYear() / 4 % 0) ? this.monthDays = 29 : this.monthDays = 28;
        break;
    }
    this.selectedYear = this.currentDate.getFullYear();
    this.tempArray = Array(this.monthDays).fill(0)
    this.treasuryLogs = this.treasuryService.treasuryLog
    this.selectedMonthLocale = this.currentDate.toLocaleString('default', { month: 'long' });
  }

  nextMonth() {
    // debugger;
    let currentMonth = Number(this.currentDate.toISOString().slice(5, 7))
    if (currentMonth === 12) {
      let nextYear = Number(this.currentDate.toISOString().slice(0, 5)) + 1
      this.currentDate = new Date(this.currentDate.toISOString().replace(/[0-9]{4}-[0-9]{2}/, nextYear + '-01'))
    } else {
      let nextMonth: string;
      currentMonth < 9 ? nextMonth = '0' + (currentMonth + 1) : nextMonth = (currentMonth + 1).toString();
      this.currentDate = new Date(this.currentDate.toISOString().replace(/-[0-9]{2}-/, '-' + nextMonth + '-'))
    }
    this.ngOnInit();
  }

  previousMonth() {
    // debugger;
    let currentMonth = Number(this.currentDate.toISOString().slice(5, 7))
    if (currentMonth === 1) {
      let previousYear = Number(this.currentDate.toISOString().slice(0, 5)) - 1
      this.currentDate = new Date(this.currentDate.toISOString().replace(/[0-9]{4}-[0-9]{2}/, previousYear + '-12'))
    } else {
      let previousMonth: string;
      currentMonth > 10 ? previousMonth = (currentMonth - 1).toString() : previousMonth = '0' + (currentMonth - 1) ;
      this.currentDate = new Date(this.currentDate.toISOString().replace(/-[0-9]{2}-/, '-' + previousMonth + '-'))
    }
    this.ngOnInit();
  }

  getDailySum(day: number) {

    let value = 0;
    this.treasuryLogs.forEach(tlog => {
      if ((new Date(tlog.date).getDate()) === day && (new Date(tlog.date).getMonth() + 1) === this.selectedMonth && (new Date(tlog.date).getFullYear()) === this.selectedYear) {
        tlog.type === 'expense' ? value -= tlog.value : value += tlog.value
      }
    });

    return value
  }

  getCatValue(day: number, cat: number): number {

    let value = 0;
    this.treasuryLogs.forEach(tlog => {
      if ((new Date(tlog.date).getDate()) === day && (new Date(tlog.date).getMonth() + 1) === this.selectedMonth && (new Date(tlog.date).getFullYear()) === this.selectedYear) {
        if (tlog.cat == cat) {
          value += tlog.value
        }
      }
    });

    return value
  }

  getSubcatValue(day: number, cat: number, subcat: number): number {

    let value = 0;
    this.treasuryLogs.forEach(tlog => {
      if ((new Date(tlog.date).getDate()) === day && (new Date(tlog.date).getMonth() + 1) === this.selectedMonth && (new Date(tlog.date).getFullYear()) === this.selectedYear) {
        if (tlog.subcat == subcat && tlog.cat == cat) {
          value += tlog.value
        }
      }
    });

    return value
  }
}
