import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { MiscService } from 'src/assets/services/misc.service';
import { CategoriesService } from '../categories/categories.service';
import { TreasuryService } from '../treasury-log/treasury.service';
import { OverviewService } from './overview.service';

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

  constructor(public categoriesService: CategoriesService, public treasuryService: TreasuryService, private _http: HttpClient, private _dialog: MatDialog, private _overviewService: OverviewService, private _miscService: MiscService) {
    this.currentDate = new Date();
    this.evoReady = false;
  }

  ngOnInit(): void {
    // trigger remoto do OnInit
    this.treasuryService.onInitTrigger.subscribe(myCustomParam => {
      this.ngOnInit();
    });
    if (!this.categoriesService.loadingComplete) { return }
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

  getCatValue(day: number, cat: number): number { return this.dailyCatEvolution[cat as keyof typeof this.dailyCatEvolution][day - 1] }
  getSubcatValue(day: number, subcat: number): number { return this.dailySubCatEvolution[subcat as keyof typeof this.dailySubCatEvolution][day - 1] }

  getDailySumAcomEvolution(): void { // total acomulado
    this.dailySumAcomEvolution = [];

    const httpParams = new HttpParams().set('month', this.selectedMonth).set('year', this.selectedYear).set('days', this.monthDays)
    const call = this._http.post('http://localhost:16190/dailysumevo', httpParams, { responseType: 'json' })

    call.subscribe({
      next: codeReceived => {
        const resp = codeReceived as number[]; this.dailySumAcomEvolution = resp;
      },
      error: err => this.categoriesService.handleError(err)
    })
  }

  getCategoriesEvolution(): void {   // categorias, subcategorias e total n acmoluado
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
      error: err => this.categoriesService.handleError(err)
    })
  }

  showDailySumDetails(day: number): void {
    const httpParams = new HttpParams().set('month', this.selectedMonth).set('year', this.selectedYear).set('day', day);
    const call = this._http.post('http://localhost:16190/getdailydetails', httpParams, { responseType: 'json' })

    call.subscribe({
      next: codeReceived => {
        const resp = codeReceived as ITreasuryLog[]
        this._overviewService.treasuryLogsForDetails = resp
        this.openDialog('300ms', '150ms', 'daily', day)
      },
      error: err => this.categoriesService.handleError(err)
    })
  }

  showDailySubCatDetails(subcatID: number, day: number): void {
    const httpParams = new HttpParams().set('month', this.selectedMonth).set('year', this.selectedYear).set('day', day).set('subcat', subcatID);
    const call = this._http.post('http://localhost:16190/getdailysubcatdetails', httpParams, { responseType: 'json' })

    call.subscribe({
      next: codeReceived => {
        const resp = codeReceived as ITreasuryLog[]
        this._overviewService.treasuryLogsForDetails = resp
        this.openDialog('300ms', '150ms', 'subcategory', day, subcatID)
      },
      error: err => this.categoriesService.handleError(err)
    })
  }

  showDailyCatDetails(catID: number, day: number): void {
    const httpParams = new HttpParams().set('month', this.selectedMonth).set('year', this.selectedYear).set('day', day).set('cat', catID);
    const call = this._http.post('http://localhost:16190/getdailycatdetails', httpParams, { responseType: 'json' })

    call.subscribe({
      next: codeReceived => {
        const resp = codeReceived as ITreasuryLog[]
        this._overviewService.treasuryLogsForDetails = resp
        this.openDialog('300ms', '150ms', 'category', day, catID)
      },
      error: err => this.categoriesService.handleError(err)
    })
  }

  // modal
  openDialog(enterAnimationDuration: string, exitAnimationDuration: string, source: string, day: number, catOrSubcat?: number): void {
    console.log(source)
    switch (source) {

      case 'category':
        this._overviewService.source = source;
        this._overviewService.titleForDetails = `${this._miscService.getCategoryTitle(catOrSubcat!)} @ ${day}/${this.selectedMonthLocale}/${this.selectedYear}`
        break;

      case 'subcategory':
        this._overviewService.source = source;
        this._overviewService.titleForDetails = `${this._miscService.getSubcategoryTitle(this._miscService.getCategoryIDFromSubcategoryID(catOrSubcat!), catOrSubcat!)} @ ${day}/${this.selectedMonthLocale}/${this.selectedYear}`
        break;

      case 'daily':
        this._overviewService.source = source;
        this._overviewService.titleForDetails = `Resumo de movimentos @ ${day}/${this.selectedMonthLocale}/${this.selectedYear}`
        break;
    }


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
  styleUrls: ['../../../../assets/styles/mhq-large-modal.scss', './overview-details-modal.scss']
})

export class OverviewDetailsModal implements AfterViewInit, OnInit {

  // datasource para tabela
  dataSource: MatTableDataSource<ITreasuryLog>;
  isDataSourceEmpty: Boolean;

  // array com as colunas da tabela
  displayedColumns: string[];

  constructor(public categoriesService: CategoriesService, public overviewService: OverviewService, public miscService: MiscService, private _router: Router, private _treasuryService: TreasuryService) {
    // this.tablesReady = false;
  }

  ngOnInit(): void {

    this.dataSource = new MatTableDataSource<ITreasuryLog>([...this.overviewService.treasuryLogsForDetails]);

    this.overviewService.treasuryLogsForDetails.length === 0 ? this.isDataSourceEmpty = true : this.isDataSourceEmpty = false;

    switch (this.overviewService.source) {

      case 'category':
        this.displayedColumns = ['subcat', 'title', 'value', 'link'];
        break;

      case 'subcategory':
        this.displayedColumns = ['title', 'value', 'link'];
        break;

      case 'daily':
        this.displayedColumns = ['icon', 'subcat', 'title', 'value', 'link'];
        break;
    }

  }

  // paginador da tabela
  @ViewChild(MatPaginator) paginator: MatPaginator;
  // afterViewInit para tabela
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  goToTreasuryLog(treasuryLogID: number, categoryID: number) {
    const ele = document.querySelector('.cdk-overlay-backdrop') as HTMLElement;
    ele.click();
    this._treasuryService.recordBorderStyle = { 'background-color': this.miscService.getCatStyleSimplex(categoryID)[0] }
    this._router.navigate(['/fi/tlogs', treasuryLogID]);
  }

}