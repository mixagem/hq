import { Component, OnInit } from '@angular/core';
import { FinancialService } from '../financial.service';



export type IMovTes = {
  date: Date,
  value: number,
  cat: string,
  subcat: string,
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
  movTes: Array<IMovTes>;

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
    this.movTes = [
      { date: new Date('August 5 , 1975'), value: 370, cat: 'second', subcat: 'daas', obs: 'sd' },
      { date: new Date('August 15 , 1975'), value: 50, cat: 'third', subcat: 'katutz', obs: 'sd' },
      { date: new Date(), value: 110, cat: 'first', subcat: 'az', obs: 's' },
      { date: new Date('August 1, 1975'), value: 220, cat: 'first', subcat: 'ew', obs: 's' }]
  }

  ngOnInit(): void {
  }

  emptyCell() {
    return 0
  }

  getDailySum(day: number) {
    const dailyMovs = this.movTes.filter(mov => mov.date.getDate() === day);
    let value = 0;
    if (dailyMovs.length > 0) { dailyMovs.forEach(mov => { value += mov.value }); }
    return value
  }

  getCatValue(day: number, cat: string): number {
    const dailyCatMovs = this.movTes.filter(mov => mov.date.getDate() === day);
    let value = 0;
    if (dailyCatMovs.length > 0) { dailyCatMovs.forEach(mov => { if (mov.cat === cat) { value += mov.value } }); }
    return value
  }

  getSubcatValue(day: number, cat: string, subcat: string): number {
    const dailySubCatMovs = this.movTes.filter(mov => mov.date.getDate() === day);
    let value = 0;
    if (dailySubCatMovs.length > 0) {
      dailySubCatMovs.forEach(mov => {
        if (mov.subcat === subcat && mov.cat === cat)
          value += mov.value
      });
    }
    return value
  }

}
