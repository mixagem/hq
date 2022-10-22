
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { ErrorHandlingService, LoadingService } from 'src/assets/services/misc.service';
import { CategoriesService } from '../../categories/categories.service';
import { TreasuryService } from '../../treasury-log/treasury.service';
import { GridViewService } from '../grid-view.service';
import { OverviewDailyDetailsModalComponent } from './overview-daily-details-modal/overview-daily-details-modal.component';

export type MonthlySnapshots = { categories: any, subcategories: any, daily: number[] }

@Component({
  selector: 'mhq-monthly-view',
  templateUrl: './monthly-view.component.html',
  styleUrls: ['./monthly-view.component.scss']
})
export class MonthlyViewComponent implements OnInit {

  gridSubtitle: string;
  gridReady: boolean; // variável com o estado de recepção do snapshot
  dailySumAcomEvolution: number[]//snapshot acomulado
  monthlySnapshots: MonthlySnapshots // objetos com snapshots recebidos
  placeholder: Array<number>; //utilizado no ngFor com o número de dias do mês
  activeCategories: IFinancialCategory[] // lista de categorias ativas
  areCategoriesReady: boolean; // estado de recepção das categorias ativas

  constructor(private _http: HttpClient, private _errorHandlingService: ErrorHandlingService, public categoriesService: CategoriesService, private _treasuryService: TreasuryService, private _loadingService: LoadingService, public gridViewService: GridViewService, private _dialog: MatDialog) {
    this.gridReady = false;
    this.areCategoriesReady = false;
    this.monthlySnapshots = { categories: {}, subcategories: {}, daily: [] } // inicializar a var
    this.getDailySumAcomEvolution();
    this.getCategoriesMonthlySnapshots(this.gridViewService.monthlyCurrentDate.getFullYear(), this.gridViewService.monthlyCurrentDate.getMonth()); // vai buscar os snapshots à bd
    this.gridSubtitle = '';
  }

  ngOnInit(): void {
    this._treasuryService.onInitTrigger.subscribe(x => { this.ngOnInit(); });     // triggers remoto do OnInit
    this.categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this._loadingService.categoriesLoadingComplete || !this._loadingService.treasuryLoadingComplete) { return }
    this.placeholder = new Array(this.gridViewService.getMonthDays(this.gridViewService.monthlyCurrentDate.getFullYear(), this.gridViewService.monthlyCurrentDate.getMonth())).fill(0);
    this.activeCategories = [...this.categoriesService.allCategories].filter(category => category.active);
    this.monthlyGridSubtitleGenerator();
    this.areCategoriesReady = true;
  }

  isLastSubcat(cat: IFinancialCategory, index: number): string {
    // o css:last-of-type tá todo fdd, tive que mandar aqui este marteladão para as curvinhas
    let lastActiveIndex = 0;
    for (let i = cat.subcats.length; i > 0; i--) { if (cat.subcats[i - 1].active) { lastActiveIndex = i - 1; break } }
    return lastActiveIndex === index ? 'mhq-last-active-subcategory' : ''
  }

  changeMonth(target: number, picker?: MatDatepicker<any>): void {
    switch (target) {
      case -1:
        this.gridViewService.monthlyCurrentDate.getMonth() === 0 ? this.gridViewService.monthlyCurrentDate.setFullYear(this.gridViewService.monthlyCurrentDate.getFullYear() - 1, 11) : this.gridViewService.monthlyCurrentDate.setMonth(this.gridViewService.monthlyCurrentDate.getMonth() - 1);
        break;

      case 1:
        this.gridViewService.monthlyCurrentDate.getMonth() === 0 ? this.gridViewService.monthlyCurrentDate.setFullYear(this.gridViewService.monthlyCurrentDate.getFullYear() + 1, 0) : this.gridViewService.monthlyCurrentDate.setMonth(this.gridViewService.monthlyCurrentDate.getMonth() + 1);
        break;

      case 0: default:
        this.gridViewService.monthlyCurrentDate = new Date();
        picker!.close();
    }

    this.getDailySumAcomEvolution();
    this.getCategoriesMonthlySnapshots(this.gridViewService.monthlyCurrentDate.getFullYear(), this.gridViewService.monthlyCurrentDate.getMonth());
    this.monthlyGridSubtitleGenerator();
  }

  getDailySumAcomEvolution(): void { // total acomulado
    this.dailySumAcomEvolution = [];

    const HTTP_PARAMS = new HttpParams().set('month', this.gridViewService.monthlyCurrentDate.getMonth()).set('year', this.gridViewService.monthlyCurrentDate.getFullYear()).set('days', this.gridViewService.getMonthDays(this.gridViewService.monthlyCurrentDate.getFullYear(), this.gridViewService.monthlyCurrentDate.getMonth()))
    const CALL = this._http.post('http://localhost:16190/dailysumevo', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as number[]; this.dailySumAcomEvolution = RESP;
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }

  // vai buscar os snapshots à bd
  getCategoriesMonthlySnapshots(year: number, month: number): void {
    const HTTP_PARAMS = new HttpParams().set('year', year).set('month', month).set('monthdays', this.gridViewService.getMonthDays(year, month))
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

  monthlyGridSubtitleGenerator(): void {
    this.gridSubtitle = this.gridViewService.monthlyCurrentDate.toLocaleString('default', { year: 'numeric', month: 'long' });
  }

  monthPicked(event: Date, picker: MatDatepicker<any>): void {
    this.gridViewService.monthlyCurrentDate.setFullYear(event.getFullYear(), event.getMonth());
    this.getDailySumAcomEvolution();
    this.getCategoriesMonthlySnapshots(this.gridViewService.monthlyCurrentDate.getFullYear(), this.gridViewService.monthlyCurrentDate.getMonth())
    this.monthlyGridSubtitleGenerator()
    picker.close();
  }

  showDailySumDetails(day: number): void {
    const HTTP_PARAMS = new HttpParams().set('month', this.gridViewService.monthlyCurrentDate.getMonth()).set('year', this.gridViewService.monthlyCurrentDate.getFullYear()).set('day', day);
    const CALL = this._http.post('http://localhost:16190/dailydetails', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as ITreasuryLog[]
        this.gridViewService.treasuryLogsForDetails = RESP
        this.openDialog('300ms', '150ms', 'daily', day)
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }

  showDailySubCatDetails(subcatID: number, day: number): void {
    const HTTP_PARAMS = new HttpParams().set('month', this.gridViewService.monthlyCurrentDate.getMonth()).set('year', this.gridViewService.monthlyCurrentDate.getFullYear()).set('day', day).set('subcat', subcatID);
    const CALL = this._http.post('http://localhost:16190/dailysubcatdetails', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as ITreasuryLog[]
        this.gridViewService.treasuryLogsForDetails = RESP
        this.openDialog('300ms', '150ms', 'subcategory', day, subcatID)
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }

  showDailyCatDetails(catID: number, day: number): void {
    const HTTP_PARAMS = new HttpParams().set('month', this.gridViewService.monthlyCurrentDate.getMonth()).set('year', this.gridViewService.monthlyCurrentDate.getFullYear()).set('day', day).set('cat', catID);
    const CALL = this._http.post('http://localhost:16190/dailycatdetails', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as ITreasuryLog[]
        this.gridViewService.treasuryLogsForDetails = RESP
        this.openDialog('300ms', '150ms', 'category', day, catID)
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }

  // modal
  openDialog(enterAnimationDuration: string, exitAnimationDuration: string, source: string, day: number, catOrSubcat?: number): void {
    switch (source) {
      case 'category':
        this.gridViewService.source = source;
        this.gridViewService.titleForDetails = `${this.categoriesService.catEnum[catOrSubcat!].title} @ ${day}/${this.gridViewService.monthlyCurrentDate.toLocaleString('default', { month: 'long' })}/${this.gridViewService.monthlyCurrentDate.getFullYear()}`
        break;

      case 'subcategory':
        this.gridViewService.source = source;
        this.gridViewService.titleForDetails = `${this.categoriesService.subcatEnum[catOrSubcat!].title} @ ${day}/${this.gridViewService.monthlyCurrentDate.toLocaleString('default', { month: 'long' })}/${this.gridViewService.monthlyCurrentDate.getFullYear()}`
        break;

      case 'daily':
        this.gridViewService.source = source;
        this.gridViewService.titleForDetails = `Resumo de movimentos @ ${day}/${this.gridViewService.monthlyCurrentDate.toLocaleString('default', { month: 'long' })}/${this.gridViewService.monthlyCurrentDate.getFullYear()}`
        break;
    }

    this._dialog.open(OverviewDailyDetailsModalComponent, {
      width: '50vw',
      height: '465px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
}