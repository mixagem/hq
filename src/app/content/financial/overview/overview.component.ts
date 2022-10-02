import { Component, OnInit } from '@angular/core';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { FinancialService } from '../financial.service';



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

  monthDays: number;
  tempArray: Array<any>;
  treasuryLogs: ITreasuryLog[];

  constructor(public financialService: FinancialService) {
    const currentDate = new Date();
    switch (currentDate.getMonth() + 1) {
      case 1: case 3: case 5: case 7: case 8: case 10: case 12:
        this.monthDays = 31;
        break;
      case 4: case 6: case 9: case 11:
        this.monthDays = 30;
        break;
      case 2:
        (currentDate.getFullYear() / 4 % 0) ? this.monthDays = 29 : this.monthDays = 28;
        break;
    }
    this.tempArray = Array(this.monthDays).fill(0)
    // this.treasuryLogs = [
    //   { date: new Date('August 5 , 1975'), value: 370, cat: 1, subcat: 1,type:'income', obs: 'sd' },
    //   { date: new Date('August 15 , 1975'), value: 50, cat: 1, subcat: 2,type:'income', obs: 'sd' },
    //   { date: new Date(), value: 110, cat: 2, subcat: 3,type:'expense', obs: 's' },
    //   { date: new Date('August 31, 1975'), value: 220, cat: 2, subcat: 4,type:'expense', obs: 's' }]
    this.treasuryLogs = this.financialService.treasuryLog
  }

  ngOnInit(): void {
    console.log(new Date(this.treasuryLogs[0].date).getDate())
  }

  getDailySum(day: number) {

    const dailyMovs = this.treasuryLogs.filter(log => new Date(log.date).getDate() === day);
    let value = 0;
    if (dailyMovs.length > 0) { dailyMovs.forEach(log => { log.type === 'expense'? value -= log.value : value += log.value }); }
    return value
  }

  getCatValue(day: number, cat: number): number {

    const dailyCatLogs = this.treasuryLogs.filter(log => new Date(log.date).getDate() === day);
    let value = 0;
    if (dailyCatLogs.length > 0) { dailyCatLogs.forEach(log => { if (log.cat == cat) { value += log.value } }); }
    return value
  }

  getSubcatValue(day: number, cat: number, subcat: number): number {
    const dailySubCatLogs = this.treasuryLogs.filter(log => new Date(log.date).getDate() === day);
    let value = 0;
    if (dailySubCatLogs.length > 0) {
      dailySubCatLogs.forEach(log => {

        if (log.subcat == subcat && log.cat == cat) {
          value += log.value
        }
      });
    }
    return value
  }
}
