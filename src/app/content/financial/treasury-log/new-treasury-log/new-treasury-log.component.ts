import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { CategoriesService } from '../../categories/categories.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TreasuryService } from '../treasury.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { ErrorHandlingService, TimerService } from 'src/assets/services/misc.service';
import { MatSelectChange } from '@angular/material/select';
import { MHQSnackBarsService } from 'src/assets/services/mhq-snackbar.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';

export type RecurrencyOptions = {
  active: boolean,
  type: string,
  freq: number,
  date: number
}

const DEFAULT_TLOG: ITreasuryLog = { id: 0, title: 'Novo movimento de tesouraria', date: Date.now(), value: 0, cat: 0, subcat: 0, type: 'expense', obs: '', recurrencyid: 0 }

@Component({
  selector: 'mhq-new-treasury-log',
  templateUrl: './new-treasury-log.component.html',
  styleUrls: ['../treasury-details/treasury-details.component.scss']
})

export class NewTreasuryLogComponent implements OnInit {
  tempTreasuryLog: ITreasuryLog;
  treasuryLogDatepicker: MatDatepicker<any>;   // datepicker
  treasuryLogDatepickerForm: FormControl<any>;
  catForm: FormControl   // autocomplete categoria
  categoriesList: string[] = [];
  subcatForm: FormControl  // autocomplete sub categoria
  subcategoriesList: string[] = [];
  recurrency: boolean   // recorrencia
  recurrencyType: string;
  recurrencyFrequency: FormControl<any>;
  saveComplete: boolean;


  constructor(private _errorHandlingService: ErrorHandlingService, public categoriesService: CategoriesService, public treasuryService: TreasuryService, public _router: Router, public _http: HttpClient, private _timerService: TimerService, private _categoriesSnackBarService: MHQSnackBarsService) {
    this.saveComplete = true;
  }

  ngOnInit(): void {
    if (this.treasuryService.cloningTreasuryLog) {
      this.tempTreasuryLog = this.treasuryService.activeTreasuryLog;
      this.tempTreasuryLog.id = 0;
      this.treasuryService.recordBorderStyle['background-color'] = this.categoriesService.catEnum[this.tempTreasuryLog.cat].bgcolor

    } else {
      this.tempTreasuryLog = JSON.parse(JSON.stringify(DEFAULT_TLOG))
      this.treasuryService.recordBorderStyle['background-color'] = 'rgb(0,0,0)'
        ;
    }
    this.treasuryLogDatepickerForm = new FormControl(new Date(this.tempTreasuryLog.date), [Validators.required]);
    if (this.treasuryService.cloningTreasuryLog) {
      this.refreshSubcategoryList(this.tempTreasuryLog.cat);
      this.catForm = new FormControl(this.categoriesService.catEnum[this.tempTreasuryLog.cat].title, [Validators.required]);
      this.subcatForm = new FormControl(this.categoriesService.subcatEnum[this.tempTreasuryLog.subcat].title, [Validators.required]);
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

  newTreasuryLogRecordActions(action: string): void {
    switch (action) {
      case 'save':
        if (this.catForm.errors || this.subcatForm.errors || this.subcatForm.value === '' || this.subcatForm.disabled) { return this.openMissingCategoriesSnackBar() }
        if (!this.recurrencyFrequency.disabled && !this.recurrencyFrequency.valid) { return this.openMissingCategoriesSnackBar() }
        const CAT = this.categoriesService.catTitleEnum[`${this.catForm.value}`];
        this.tempTreasuryLog.date = this.treasuryLogDatepickerForm.value.getTime();
        this.tempTreasuryLog.cat = CAT.id;
        this.tempTreasuryLog.subcat = this.categoriesService.subcatTitleEnum[`${this.subcatForm.value}`].id;
        this.tempTreasuryLog.value = Number(this.tempTreasuryLog.value.toString().replace(',', '.'))
        if (!this.tempTreasuryLog.value.toString().match(/^[0-9]*\.?[0-9]{0,2}$/g)) {
          return this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', 'Valor', ['O campo ', ' encontra-se incorretamente definido.']);
        }
        this.createTreasurylog();
        break;

      case 'end': default:
        document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight');
        this._timerService.timer = setTimeout(navi.bind(null, this._router), 1000)
        function navi(router: Router): void {
          router.navigate(['/fi/tlogs'])
        }
    }
  }

  createTreasurylog(): void {
    const RECURRENCY_OPTIONS: RecurrencyOptions = {
      active: this.recurrency,
      type: this.recurrencyType,
      freq: this.recurrencyFrequency.value,
      date: new Date(this.tempTreasuryLog.date).getDate()
    }
    const HTTP_PARAMS = new HttpParams().set('tlog', JSON.stringify(this.tempTreasuryLog)).set('recurrency', JSON.stringify(RECURRENCY_OPTIONS));
    const CALL = this._http.post('http://localhost:16190/createtreasurylog', HTTP_PARAMS, { responseType: 'text' });

    this.saveComplete = false;

    CALL.subscribe({
      next: codeReceived => {
        this.treasuryService.recordBorderStyle['background-color'] = this.categoriesService.catEnum[this.tempTreasuryLog.cat].bgcolor
        this.treasuryService.fetchTreasuryLog('saveTreasuryLog', Number(codeReceived));
        RECURRENCY_OPTIONS.active ? this._categoriesSnackBarService.triggerMHQSnackbar(true, 'playlist_add', this.tempTreasuryLog.title, ['Os movimentos ', ' foram criados com sucesso.']) : this._categoriesSnackBarService.triggerMHQSnackbar(true, 'playlist_add', this.tempTreasuryLog.title, ['O movimento ', ' foi criado com sucesso.']); // dispara a snackbar
        this.saveComplete = true;
      },
      error: err => {
        this._errorHandlingService.handleError(err);
        RECURRENCY_OPTIONS.active ? this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', this.tempTreasuryLog.title, ['Ocurreu algo inesperado ao criar os movimentos ', '.']) : this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', this.tempTreasuryLog.title, ['Ocurreu algo inesperado ao criar o movimento ', '.']); // dispara a snackbar
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
