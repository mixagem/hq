import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { CategoriesService } from '../../categories/categories.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatDatepicker } from '@angular/material/datepicker';
import { ErrorHandlingService, LoadingService, TimerService } from 'src/assets/services/misc.service';
import { MatSelectChange } from '@angular/material/select';
import { MHQSnackBarsService } from 'src/assets/services/mhq-snackbar.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { BudgetingService } from '../budgeting.service';

export type RecurrencyOptions = { active: boolean, type: string, freq: number, date: number }

const DEFAULT_TLOG: ITreasuryLog = { id: 0, title: 'Novo movimento de tesouraria', date: Date.now(), value: 0, cat: 0, subcat: 0, type: 'expense', obs: '', recurrencyid: 0, nif: false, efat: 0, efatcheck:false }


@Component({
  selector: 'mhq-new-budget',
  templateUrl: './new-budget.component.html',
  styleUrls: ['../../../../../assets/styles/mhq-mainform-details.scss']
})
export class NewBudgetComponent implements OnInit {
  tempBudgetLog: ITreasuryLog;
  budgetLogDatepicker: MatDatepicker<any>;   // datepicker
  budgetLogDatepickerForm: FormControl<any>;
  catForm: FormControl   // autocomplete categoria
  categoriesList: string[] = [];
  subcatForm: FormControl  // autocomplete sub categoria
  subcategoriesList: string[] = [];
  recurrency: boolean   // recorrencia
  recurrencyType: string;
  recurrencyFrequency: FormControl<any>;
  saveComplete: boolean;


  constructor(private _errorHandlingService: ErrorHandlingService, public categoriesService: CategoriesService, public budgetingService: BudgetingService, public _router: Router, public _http: HttpClient, private _timerService: TimerService, private _categoriesSnackBarService: MHQSnackBarsService, public loadingService: LoadingService) {
    this.saveComplete = true;
  }

  ngOnInit(): void {

    this.budgetingService.onInitTrigger.subscribe(x => { this.ngOnInit(); }); this.categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this.loadingService.categoriesLoadingComplete || !this.loadingService.budgetingLoadingComplete) { return }     // loading check

    if (this.budgetingService.cloningBudgetLog) {
      this.tempBudgetLog = this.budgetingService.activeBudgetLog;
      this.tempBudgetLog.id = 0;
      this.budgetingService.recordBorderStyle['background-color'] = this.categoriesService.catEnum[this.tempBudgetLog.cat].bgcolor

    } else {
      this.tempBudgetLog = JSON.parse(JSON.stringify(DEFAULT_TLOG))
      this.budgetingService.recordBorderStyle['background-color'] = 'rgb(0,0,0)';
    }
    this.budgetLogDatepickerForm = new FormControl(new Date(this.tempBudgetLog.date), [Validators.required]);
    if (this.budgetingService.cloningBudgetLog) {
      this.refreshSubcategoryList(this.tempBudgetLog.cat);
      this.catForm = new FormControl(this.categoriesService.catEnum[this.tempBudgetLog.cat].title, [Validators.required]);
      this.subcatForm = new FormControl(this.categoriesService.subcatEnum[this.tempBudgetLog.subcat].title, [Validators.required]);
    } else {
      this.catForm = new FormControl('', [Validators.required]);
      this.subcatForm = new FormControl({ value: '', disabled: true }, [Validators.required]);
    }
    this.categoriesService.allCategories.forEach(cat => { this.categoriesList.push(cat.title) });
    this.recurrencyFrequency = new FormControl({ value: '', disabled: true }, [Validators.required, Validators.min(2)]);
  }

  openMissingCategoriesSnackBar(): void {
    this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', 'categoria/sub-categoria', ['O par ', 'não se encontra definido.'])
  }

  newBudgetLogRecordActions(action: string): void {
    switch (action) {
      case 'save':
        if (this.catForm.errors || this.subcatForm.errors || this.subcatForm.value === '' || this.subcatForm.disabled) { return this.openMissingCategoriesSnackBar() }
        if (!this.recurrencyFrequency.disabled && !this.recurrencyFrequency.valid) { return this.openMissingCategoriesSnackBar() }
        const CAT = this.categoriesService.catTitleEnum[`${this.catForm.value}`];
        this.tempBudgetLog.date = this.budgetLogDatepickerForm.value.getTime();
        this.tempBudgetLog.cat = CAT.id;
        this.tempBudgetLog.subcat = this.categoriesService.subcatTitleEnum[`${this.subcatForm.value}`].id;
        this.tempBudgetLog.value = Number(this.tempBudgetLog.value.toString().replace(',', '.'))
        if (!this.tempBudgetLog.value.toString().match(/^[0-9]*\.?[0-9]{0,2}$/g)) {
          return this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', 'Valor', ['O campo ', ' encontra-se incorretamente definido.']);
        }
        this.createBugetLog();
        break;

      case 'end': default:
        document.querySelector('#mhq-budget-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight');
        this._timerService.timer = setTimeout(navi.bind(null, this._router), 750)
        function navi(router: Router): void {
          router.navigate(['/fi/budget'])
        }
    }
  }

  createBugetLog(): void {
    const RECURRENCY_OPTIONS: RecurrencyOptions = {
      active: this.recurrency,
      type: this.recurrencyType,
      freq: this.recurrencyFrequency.value,
      date: new Date(this.tempBudgetLog.date).getDate()
    }
    const HTTP_PARAMS = new HttpParams().set('budget', JSON.stringify(this.tempBudgetLog)).set('recurrency', JSON.stringify(RECURRENCY_OPTIONS));
    const CALL = this._http.post('http://localhost:16190/createbudgetlog', HTTP_PARAMS, { responseType: 'text' });

    this.saveComplete = false;

    CALL.subscribe({
      next: codeReceived => {
        this.budgetingService.recordBorderStyle['background-color'] = this.categoriesService.catEnum[this.tempBudgetLog.cat].bgcolor
        this.budgetingService.fetchBudgetLog('saveBudgetLog', Number(codeReceived));
        RECURRENCY_OPTIONS.active ? this._categoriesSnackBarService.triggerMHQSnackbar(true, 'playlist_add', this.tempBudgetLog.title, ['Os movimentos ', ' foram criados com sucesso.']) : this._categoriesSnackBarService.triggerMHQSnackbar(true, 'playlist_add', this.tempBudgetLog.title, ['O movimento ', ' foi criado com sucesso.']); // dispara a snackbar
        this.saveComplete = true;
      },
      error: err => {
        this._errorHandlingService.handleError(err);
        RECURRENCY_OPTIONS.active ? this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', this.tempBudgetLog.title, ['Ocurreu algo inesperado ao criar os movimentos ', '.']) : this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', this.tempBudgetLog.title, ['Ocurreu algo inesperado ao criar o movimento ', '.']); // dispara a snackbar
        this.saveComplete = true;
      }
    })
  }

  refreshSubcategoryList(catID: number = 0, catTitle: string = ''): void {
    let category: IFinancialCategory;
    if (catID !== 0) { category = this.categoriesService.catEnum[catID]; }
    if (catTitle !== '') { category = this.categoriesService.catTitleEnum[`${catTitle}`] }

    this.subcategoriesList = [];
    category!.subcats.forEach(subcat => { this.subcategoriesList.push(subcat.title) });
  }

  categorySelectChanged(event: MatSelectChange): void {
    this.refreshSubcategoryList(0, event.value);
    this.subcatForm.setValue('');
    this.subcategoriesList.length > 0 ? this.subcatForm.enable() : this.subcatForm.disable();
  }

  recurrencyToggle(event: MatSlideToggleChange): void {
    event.checked ? this.recurrencyFrequency.enable() : this.recurrencyFrequency.disable();
  }
}
