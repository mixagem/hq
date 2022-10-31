import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { ErrorHandlingService, LoadingService } from 'src/assets/services/misc.service';
import { CategoriesService } from '../../categories/categories.service';
import { GridViewService } from '../grid-view.service';
import { OverviewDailyDetailsModalComponent } from '../monthly-view/overview-daily-details-modal/overview-daily-details-modal.component';

export type YearlySnapshots = { categories: any, subcategories: any, daily: number[] }


@Component({
  selector: 'mhq-anual-view',
  templateUrl: './anual-view.component.html',
  styleUrls: ['./anual-view.component.scss']
})
export class AnualViewComponent implements OnInit {
  firstLoadingComplete: boolean;

  gridSubtitle: string;
  gridReady: boolean; // variável com o estado de recepção do snapshot
  monthlySumAcomEvolution: number[]//snapshot acomulado
  yearlySnapshots: YearlySnapshots // objetos com snapshots recebidos
  placeholder: Array<number>; //utilizado no ngFor com o número de dias do mês
  activeCategories: IFinancialCategory[] // lista de categorias ativas
  areCategoriesReady: boolean; // estado de recepção das categorias ativas

  constructor(public gridViewService: GridViewService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService, public categoriesService: CategoriesService, private _loadingService: LoadingService, private _gridViewService: GridViewService, private _dialog: MatDialog) {
    this.gridReady = false;
    this.areCategoriesReady = false;
    this.yearlySnapshots = { categories: {}, subcategories: {}, daily: [] } // inicializar a var
    this.getMonthlySumAcomEvolution();
    this.getCategoriesYearlySnapshots(this._gridViewService.monthlyCurrentDate.getFullYear()); // vai buscar os snapshots à bd
    this.gridSubtitle = '';
    this.gridViewService.selectedView = 'anual';
  }

  ngOnInit(): void {   // triggers remoto do OnInit
    this.categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this._loadingService.categoriesLoadingComplete || this.firstLoadingComplete) { return }
    this.firstLoadingComplete = true;
    this.placeholder = new Array(12).fill(0);

    this.activeCategories = [];
    for (let i = 0; i < Object.keys(this.categoriesService.catTable).length; i++) {
      if (this.categoriesService.catTable[Object.keys(this.categoriesService.catTable)[i]].active) {
        this.activeCategories.push(this.categoriesService.catTable[Object.keys(this.categoriesService.catTable)[i]])
      }
    }
    this.yearlyGridSubtitleGenerator();
    this.areCategoriesReady = true;
  }

  monthLocale(month: number): string {
    const TEMP_DATE = new Date(Date.now()); TEMP_DATE.setMonth(month,1);
    return TEMP_DATE.toLocaleString('default', { month: 'long' });
  }

  isLastSubcat(cat: IFinancialCategory, index: number): string {
    // o css:last-of-type tá todo fdd, tive que mandar aqui este marteladão para as curvinhas
    let lastActiveIndex = 0;
    for (let i = cat.subcats.length; i > 0; i--) { if (cat.subcats[i - 1].active) { lastActiveIndex = i - 1; break } }
    return lastActiveIndex === index ? 'mhq-last-active-subcategory' : ''
  }

  changeYear(target: number, picker?: MatDatepicker<any>): void {
    switch (target) {
      case -1:
        this._gridViewService.monthlyCurrentDate.setFullYear(this._gridViewService.monthlyCurrentDate.getFullYear() - 1);
        break;

      case 1:
        this._gridViewService.monthlyCurrentDate.setFullYear(this._gridViewService.monthlyCurrentDate.getFullYear() + 1)
        break;

      case 0: default:
        this._gridViewService.monthlyCurrentDate = new Date();
        picker!.close();
    }


    this.getMonthlySumAcomEvolution();
    this.getCategoriesYearlySnapshots(this._gridViewService.monthlyCurrentDate.getFullYear());
    this.yearlyGridSubtitleGenerator();
  }

  getMonthlySumAcomEvolution(): void { // total acomulado
    this.monthlySumAcomEvolution = [];

    const HTTP_PARAMS = new HttpParams().set('year', this._gridViewService.monthlyCurrentDate.getFullYear())
    const CALL = this._http.post('http://localhost:16190/monthlysumevo', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as number[]; this.monthlySumAcomEvolution = RESP;
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }

  // vai buscar os snapshots à bd
  getCategoriesYearlySnapshots(year: number): void {
    const HTTP_PARAMS = new HttpParams().set('year', year)
    const CALL = this._http.post('http://localhost:16190/monthlycatsevo', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        this.gridReady = false;
        const RESP = codeReceived as any[];
        this.yearlySnapshots.categories = RESP[0];
        this.yearlySnapshots.subcategories = RESP[1];
        this.yearlySnapshots.daily = RESP[2];
        this.gridReady = true;
        this.ngOnInit();
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }

  yearPicked(event: Date, picker: MatDatepicker<any>): void {
    this._gridViewService.monthlyCurrentDate.setFullYear(event.getFullYear());
    this.getMonthlySumAcomEvolution();
    this.getCategoriesYearlySnapshots(this._gridViewService.monthlyCurrentDate.getFullYear())
    this.yearlyGridSubtitleGenerator()
    picker.close();
  }

  showMonthlySumDetails(month: number): void {
    const HTTP_PARAMS = new HttpParams().set('month', month).set('year', this._gridViewService.monthlyCurrentDate.getFullYear());
    const CALL = this._http.post('http://localhost:16190/monthlydetails', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as ITreasuryLog[]
        this._gridViewService.treasuryLogsForDetails = RESP
        this.openDialog('300ms', '150ms', 'daily', month)
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }

  showMonthlySubCatDetails(subcatID: number, month: number): void {
    const HTTP_PARAMS = new HttpParams().set('month', month).set('year', this._gridViewService.monthlyCurrentDate.getFullYear()).set('subcat', subcatID);
    const CALL = this._http.post('http://localhost:16190/monthlysubcatdetails', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as ITreasuryLog[]
        this._gridViewService.treasuryLogsForDetails = RESP
        this.openDialog('300ms', '150ms', 'subcategory', month, subcatID)
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }

  showMonthlyCatDetails(catID: number, month: number): void {
    const HTTP_PARAMS = new HttpParams().set('month', month).set('year', this._gridViewService.monthlyCurrentDate.getFullYear()).set('cat', catID);
    const CALL = this._http.post('http://localhost:16190/monthlycatdetails', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as ITreasuryLog[]
        this._gridViewService.treasuryLogsForDetails = RESP
        this.openDialog('300ms', '150ms', 'category', month, catID)
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }

  // modal
  openDialog(enterAnimationDuration: string, exitAnimationDuration: string, source: string, month: number, catOrSubcat?: number): void {
    switch (source) {

      case 'category':
        this._gridViewService.source = source;
        this._gridViewService.titleForDetails = `${this.categoriesService.catTable[`'${catOrSubcat!}'`].title} @ ${new Date(1970, month, 1).toLocaleString('default', { month: 'long' })}/${this._gridViewService.monthlyCurrentDate.getFullYear()}`
        break;

      case 'subcategory':
        this._gridViewService.source = source;
        this._gridViewService.titleForDetails = `${this.categoriesService.subcatTable[catOrSubcat!].title} @ ${new Date(1970, month, 1).toLocaleString('default', { month: 'long' })}/${this._gridViewService.monthlyCurrentDate.getFullYear()}`
        break;

      case 'daily':
        this._gridViewService.source = source;
        this._gridViewService.titleForDetails = `Resumo de movimentos @ ${new Date(1970, month, 1).toLocaleString('default', { month: 'long' })}/${this._gridViewService.monthlyCurrentDate.getFullYear()}`
        break;
    }

    this._dialog.open(OverviewDailyDetailsModalComponent, { width: '50vw', height: '465px', enterAnimationDuration, exitAnimationDuration, });
  }


  yearlyGridSubtitleGenerator(): void { this.gridSubtitle = this._gridViewService.monthlyCurrentDate.getFullYear().toString(); }

}