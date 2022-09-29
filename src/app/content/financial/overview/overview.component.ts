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
    // primeiro, obtemos o mes atual, e o numero de dias que o mes tem
    // depois fazemos query ao movimentos tesouraria para o mes que estamos

    switch (currentDate.getMonth()+1) {
      case 1: case 3: case 5: case 7: case 8: case 10: case 12:
        this.monthDays = 31;
        break;
      case 4: case 6: case 9: case 11:
        this.monthDays = 30;
        break;
      case 2:
        this.monthDays = 28;
        break;
    }
    this.tempArray = Array(this.monthDays).fill(0)
    this.movTes = [
      { date: new Date(), value: 110, cat: 'first', subcat: 'az', obs: 's' },
      { date: new Date('August 1, 1975'), value: 220, cat: 'first', subcat: 'ew', obs: 's' }]
  }

  ngOnInit(): void {
  }

  getEmptymambo(){
    return 0
  }

  getmambo(cellDay:number, cat:string): number{
    const teste = this.movTes.filter(mov => mov.date.getDate() === cellDay);
    let value = 0;
    if (teste.length > 0){
      teste.forEach(mov => {
        if(mov.cat === cat)
        value += mov.value
      });
    }
    return value
  }

  getSubmambo(cellDay:number, subcat:string): number{
    const teste = this.movTes.filter(mov => mov.date.getDate() === cellDay);
    let value = 0;
    if (teste.length > 0){
      teste.forEach(mov => {
        if(mov.subcat === subcat)
        value += mov.value
      });
    }
    return value
  }

}
