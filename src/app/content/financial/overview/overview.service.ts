import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { FinancialService } from '../financial.service';
import { TreasuryService } from '../treasury-log/treasury.service';

@Injectable({
  providedIn: 'root'
})

export class OverviewService implements OnInit {

  tempArray: Array<any>;
  treasuryLogs: ITreasuryLog[];

  currentDate: Date
  selectedMonth: number;
  selectedMonthLocale: string;
  monthDays: number;
  selectedYear: number;
  dailySumEvolution: number[];

  dailyCatEvolution: object;
  dailySubCatEvolution: object;

  constructor(private _financialService: FinancialService, private _treasuryService: TreasuryService, private _http: HttpClient) {

    this.currentDate = new Date();
    // this.ngOnInit();
  }

  ngOnInit(): void {
    this.selectedMonth = this.currentDate.getMonth() + 1
    // console.log(this.selectedMonth)
    switch (this.selectedMonth) {

      case 1: case 3: case 5: case 7: case 8: case 10: case 12:
        this.monthDays = 31;
        break;
      case 4: case 6: case 9: case 11:
        this.monthDays = 30;
        break;
      case 2:
        (this.currentDate.getFullYear() % 4 === 0) ? this.monthDays = 29 : this.monthDays = 28;
        break;
    }
    this.selectedYear = this.currentDate.getFullYear();
    this.tempArray = Array(this.monthDays).fill(0)
    this.treasuryLogs = this._treasuryService.treasuryLog
    this.selectedMonthLocale = this.currentDate.toLocaleString('default', { month: 'long' });
    this.getDailySumEvolution();
    this.getCategoriesEvolution();
  }

  getDailySumEvolution() {

    this.dailySumEvolution = [];

    const httpParams = new HttpParams().set('month', this.selectedMonth).set('year', this.selectedYear).set('days', this.monthDays)
    const call = this._http.post('http://localhost:16190/dailysumevo', httpParams, { responseType: 'json' })

    call.subscribe({
      next: codeReceived => {
        const resp = codeReceived as number[]; this.dailySumEvolution = resp;
      },
      error: err => this._financialService.handleError(err)
    })
    // query 1 à bd com o valor acomulado ao inicio do mês => getDailySumEvolution()
    // query2 à bd: obter  os movimentos para o mês selecionado => getDailySumEvolution()
    // fazer loop para todos os dias do mes, em que mandamos o resultado do acomulado do dia para um array de resultados acomulados => [dailySumEvolution]
    // saldo acomumlado dia 1 = saldo acomulado + saldo dia 1
    // dia n... = saldo dia n + saldo acomulado dia n-1
  }


  getCategoriesEvolution() {

    this.dailyCatEvolution = [];
    this.dailySubCatEvolution = [];

    const httpParams = new HttpParams().set('month', this.selectedMonth).set('year', this.selectedYear).set('days', this.monthDays)
    const call = this._http.post('http://localhost:16190/dailycatsevo', httpParams, { responseType: 'json' })

    call.subscribe({
      next: codeReceived => {
        const resp = codeReceived as Object[]; this.dailyCatEvolution = resp[0]; this.dailySubCatEvolution = resp[1];

      },
      error: err => this._financialService.handleError(err)
    })

  }


  nextMonth(): void {
    let currentMonth = Number(this.currentDate.toISOString().slice(5, 7))
    if (currentMonth === 12) {
      let nextYear = Number(this.currentDate.toISOString().slice(0, 4)) + 1
      this.currentDate = new Date(this.currentDate.toISOString().replace(/[0-9]{4}-[0-9]{2}/, nextYear + '-01'))
    } else {
      let nextMonth: string;
      currentMonth < 9 ? nextMonth = '0' + (currentMonth + 1) : nextMonth = (currentMonth + 1).toString();
      this.currentDate = new Date(this.currentDate.toISOString().replace(/-[0-9]{2}-/, '-' + nextMonth + '-'))
    }
    this.ngOnInit();
  }

  previousMonth(): void {
    let currentMonth = Number(this.currentDate.toISOString().slice(5, 7))
    if (currentMonth === 1) {
      let previousYear = Number(this.currentDate.toISOString().slice(0, 4)) - 1
      this.currentDate = new Date(this.currentDate.toISOString().replace(/[0-9]{4}-[0-9]{2}/, previousYear + '-12'))
    } else {
      let previousMonth: string;
      currentMonth > 10 ? previousMonth = (currentMonth - 1).toString() : previousMonth = '0' + (currentMonth - 1);
      this.currentDate = new Date(this.currentDate.toISOString().replace(/-[0-9]{2}-/, '-' + previousMonth + '-'))
    }
    this.ngOnInit();
  }

  getCatValue(day: number, cat: number) {

   setTimeout(() => {
      return this.dailyCatEvolution[cat as keyof object][day]
    }, 1000);

  }
}
