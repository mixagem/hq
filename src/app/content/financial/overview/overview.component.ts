import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { FinancialService } from '../financial.service';
import { TreasuryService } from '../treasury-log/treasury.service';
import { OverviewService } from './overview.service';



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

  evoReady: Boolean;

  currentDate: Date
  selectedMonth: number;
  selectedMonthLocale: string;
  monthDays: number;
  selectedYear: number;
  dailySumEvolution: number[];
  dailySumAcomEvolution: number[];
  dailyCatEvolution: object;
  dailySubCatEvolution: object;

  constructor(public financialService: FinancialService, public treasuryService: TreasuryService, private _http: HttpClient, private _dialog: MatDialog, private _overviewService: OverviewService) {
    this.currentDate = new Date();
    this.evoReady = false;
  }

  ngOnInit(): void {
    // trigger remoto do OnInit
    this.treasuryService.onInitTrigger.subscribe(myCustomParam => {
      this.ngOnInit();
    });
    if (!this.financialService.loadingComplete) { return }
    this.selectedMonth = this.currentDate.getMonth() + 1
    console.log(this.selectedMonth)
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
    this.treasuryLogs = this.treasuryService.treasuryLog
    this.selectedMonthLocale = this.currentDate.toLocaleString('default', { month: 'long' });
    this.getDailySumAcomEvolution();
    this.getCategoriesEvolution();
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
    this.evoReady = false;
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
    this.evoReady = false;
    this.ngOnInit();
  }


  getSuperSum(day: number) { return this.dailySumAcomEvolution[day - 1]; }
  getDailySum(day: number): number { return this.dailySumEvolution[day - 1]; }
  getCatValue(day: number, cat: number): number { return this.dailyCatEvolution[cat as keyof typeof this.dailyCatEvolution][day - 1] }
  getSubcatValue(day: number, subcat: number): number { return this.dailySubCatEvolution[subcat as keyof typeof this.dailySubCatEvolution][day - 1] }


  getDailySumAcomEvolution() {

    this.dailySumAcomEvolution = [];

    const httpParams = new HttpParams().set('month', this.selectedMonth).set('year', this.selectedYear).set('days', this.monthDays)
    const call = this._http.post('http://localhost:16190/dailysumevo', httpParams, { responseType: 'json' })

    call.subscribe({
      next: codeReceived => {
        const resp = codeReceived as number[]; this.dailySumAcomEvolution = resp;
      },
      error: err => this.financialService.handleError(err)
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
        const resp = codeReceived as object[]; this.dailyCatEvolution = resp[0]; this.dailySubCatEvolution = resp[1]; console.log(this.dailySumEvolution = resp[2] as number[]);
        this.evoReady = true;
        console.log(this.dailyCatEvolution[1 as keyof typeof this.dailyCatEvolution][9]) // fuck yes bro
      },
      error: err => this.financialService.handleError(err)
    })

  }

  showDailySumDetails(day: number) {
    const httpParams = new HttpParams().set('month', this.selectedMonth).set('year', this.selectedYear).set('day', day);
    const call = this._http.post('http://localhost:16190/getdailydetails', httpParams, { responseType: 'json' })

    call.subscribe({
      next: codeReceived => {
        const resp = codeReceived as ITreasuryLog[]
        this._overviewService.treasuryLogsForDetails = resp
        this.openDialog('300ms', '150ms')
      },
      error: err => this.financialService.handleError(err)
    })


  }

  showDailySubCatDetails(subcatID: number, day: number) {

    const httpParams = new HttpParams().set('month', this.selectedMonth).set('year', this.selectedYear).set('day', day).set('subcat', subcatID);
    const call = this._http.post('http://localhost:16190/getdailysubcatdetails', httpParams, { responseType: 'json' })

    call.subscribe({
      next: codeReceived => {
        const resp = codeReceived as ITreasuryLog[]
        this._overviewService.treasuryLogsForDetails = resp
        this.openDialog('300ms', '150ms')
      },
      error: err => this.financialService.handleError(err)
    })
  }


  showDailyCatDetails(catID: number, day: number) {

    const httpParams = new HttpParams().set('month', this.selectedMonth).set('year', this.selectedYear).set('day', day).set('cat', catID);
    const call = this._http.post('http://localhost:16190/getdailycatdetails', httpParams, { responseType: 'json' })

    call.subscribe({
      next: codeReceived => {
        const resp = codeReceived as ITreasuryLog[]
        this._overviewService.treasuryLogsForDetails = resp
        this.openDialog('300ms', '150ms')
      },
      error: err => this.financialService.handleError(err)
    })

  }


  // modal
  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this._dialog.open(OverviewDetailsModal, {
      width: '50vw',
      height: '50vh',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

}




// modal
@Component({
  selector: 'overview-details-modal',
  templateUrl: './overview-details-modal.html',
  styleUrls: ['../../../../assets/styles/mhq-large-modal.scss']
})

export class OverviewDetailsModal implements OnInit {




  constructor(public financialService: FinancialService, private _http: HttpClient, public overviewService: OverviewService) { }

  ngOnInit(): void {



  }

  datePipe(dateInMilli:number): string {
    return new Date(dateInMilli).toLocaleDateString('pt')
  }



}