
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { ErrorHandlingService, LoadingService, MiscService } from 'src/assets/services/misc.service';
import { CategoriesService } from '../../categories/categories.service';
import { TreasuryService } from '../../treasury-log/treasury.service';
import { GridViewService } from '../grid-view.service';

export type MonthlySnapshots = {
  categories: any,
  subcategories: any,
  daily: number[]
}

@Component({
  selector: 'mhq-monthly-view',
  templateUrl: './monthly-view.component.html',
  styleUrls: ['./monthly-view.component.scss']
})
export class MonthlyViewComponent implements OnInit {

  currentDate: Date; // data utilizada para navegação
  gridReady: boolean; // variável com o estado de recepção do snapshot
  monthlySnapshots: MonthlySnapshots // objetos com snapshots recebidos
  placeholder: Array<number>; //utilizado no ngFor com o número de dias do mês
  activeCategories: IFinancialCategory[] // lista de categorias ativas
  areCategoriesReady: boolean; // estado de recepção das categorias ativas

  constructor(private _http: HttpClient, private _errorHandlingService: ErrorHandlingService, private _categoriesService: CategoriesService, private _treasuryService: TreasuryService, private _loadingService: LoadingService, public miscService: MiscService, private _gridviewService:GridViewService, private _dialog: MatDialog) {
    this.gridReady = false;
    this.areCategoriesReady = false;
    this.currentDate = new Date(); // inicializa a data com a data atual
    this.getCategoriesMonthlySnapshots((new Date().getFullYear()), (new Date().getMonth())); // vai buscar os snapshots à bd
    this.monthlySnapshots = { categories: {}, subcategories: {}, daily: [] } // inicializar a var
  }

  ngOnInit(): void {
    this._treasuryService.onInitTrigger.subscribe(x => { this.ngOnInit(); });     // triggers remoto do OnInit
    this._categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this._loadingService.categoriesLoadingComplete || !this._loadingService.treasuryLoadingComplete) { return }
    this.placeholder = new Array(this._gridviewService.getMonthDays(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1)).fill(0);
    this.activeCategories = [...this._categoriesService.incomeCategories, ...this._categoriesService.expenseCategories].filter(category => category.active);
    this.areCategoriesReady = true;
  }

  changeMonth(target: number): void {
    if (target === -1) {
      if (this.currentDate.getMonth() === 0) {
        this.currentDate.setFullYear(this.currentDate.getFullYear() - 1, 11);
      } else {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1)
      }
    } else {
      if (this.currentDate.getMonth() === 11) {
        this.currentDate.setFullYear(this.currentDate.getFullYear() + 1, 0);
      } else {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1)
      }
    }
    this.getCategoriesMonthlySnapshots(this.currentDate.getFullYear(), this.currentDate.getMonth())
  }

  // vai buscar os snapshots à bd
  getCategoriesMonthlySnapshots(year: number, month: number) {
    const HTTP_PARAMS = new HttpParams().set('year', year).set('month', month + 1).set('monthdays', this._gridviewService.getMonthDays(year, month + 1))
    const CALL = this._http.post('http://localhost:16190/dailycatsevo', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        this.gridReady = false;
        const RESP = codeReceived as any[];
        this.monthlySnapshots.categories = RESP[0];
        this.monthlySnapshots.subcategories = RESP[1];
        this.monthlySnapshots.daily = RESP[2];
        this.gridReady = true;
        this.ngOnInit();
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }


  // showDailySumDetails(day: number): void {
  //   const HTTP_PARAMS = new HttpParams().set('month',999).set('year', 999).set('day', day);
  //   const CALL = this._http.post('http://localhost:16190/getdailydetails', HTTP_PARAMS, { responseType: 'json' })

  //   CALL.subscribe({
  //     next: codeReceived => {
  //       const RESP = codeReceived as ITreasuryLog[]
  //       this._overviewService.treasuryLogsForDetails = RESP
  //       this.openDialog('300ms', '150ms', 'daily', day)
  //     },
  //     error: err => this._errorHandlingService.handleError(err)
  //   })
  // }

  // showDailySubCatDetails(subcatID: number, day: number): void {
  //   const HTTP_PARAMS = new HttpParams().set('month', 999).set('year', 999).set('day', day).set('subcat', subcatID);
  //   const CALL = this._http.post('http://localhost:16190/getdailysubcatdetails', HTTP_PARAMS, { responseType: 'json' })

  //   CALL.subscribe({
  //     next: codeReceived => {
  //       const RESP = codeReceived as ITreasuryLog[]
  //       this._overviewService.treasuryLogsForDetails = RESP
  //       this.openDialog('300ms', '150ms', 'subcategory', day, subcatID)
  //     },
  //     error: err => this._errorHandlingService.handleError(err)
  //   })
  // }

  // showDailyCatDetails(catID: number, day: number): void {
  //   const HTTP_PARAMS = new HttpParams().set('month', 999).set('year', 999).set('day', day).set('cat', catID);
  //   const CALL = this._http.post('http://localhost:16190/getdailycatdetails', HTTP_PARAMS, { responseType: 'json' })

  //   CALL.subscribe({
  //     next: codeReceived => {
  //       const RESP = codeReceived as ITreasuryLog[]
  //       this._overviewService.treasuryLogsForDetails = RESP
  //       this.openDialog('300ms', '150ms', 'category', day, catID)
  //     },
  //     error: err => this._errorHandlingService.handleError(err)
  //   })
  // }


  // // modal
  // openDialog(enterAnimationDuration: string, exitAnimationDuration: string, source: string, day: number, catOrSubcat?: number): void {
  //   switch (source) {

  //     case 'category':
  //       this._overviewService.source = source;
  //       this._overviewService.titleForDetails = `${this._miscService.getCategoryTitle(catOrSubcat!)} @ ${day}/${this.selectedMonthLocale}/${this.selectedYear}`
  //       break;

  //     case 'subcategory':
  //       this._overviewService.source = source;
  //       this._overviewService.titleForDetails = `${this._miscService.getSubcategoryTitle(this._miscService.getCategoryIDFromSubcategoryID(catOrSubcat!), catOrSubcat!)} @ ${day}/${this.selectedMonthLocale}/${this.selectedYear}`
  //       break;

  //     case 'daily':
  //       this._overviewService.source = source;
  //       this._overviewService.titleForDetails = `Resumo de movimentos @ ${day}/${this.selectedMonthLocale}/${this.selectedYear}`
  //       break;
  //   }


  //   this._dialog.open(OverviewDailyDetailsModalComponent, {
  //     width: '50vw',
  //     height: '50vh',
  //     enterAnimationDuration,
  //     exitAnimationDuration,
  //   });

  // }


}