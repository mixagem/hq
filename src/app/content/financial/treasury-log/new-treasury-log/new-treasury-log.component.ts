import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ITreasuryLog } from 'src/shared/interfaces/itreasury-log';
import { CategoriesService } from '../../categories/categories.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TreasuryService } from '../treasury.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { ErrorHandlingService, LoadingService, TimerService } from 'src/shared/services/misc.service';
import { MatSelectChange } from '@angular/material/select';
import { MHQSnackBarsService } from 'src/shared/services/mhq-snackbar.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { IFinancialSubCategory } from 'src/shared/interfaces/ifinancial-sub-category';
import { EfaturaService } from '../../efatura/efatura.service';
import { MatCheckboxChange } from '@angular/material/checkbox';

type RecurrencyOptions = { active: boolean, type: string, freq: number, date: number }
type SelectEnum = { title: string, value: number }
type RecordActions = 'save' | 'cancel'

const DEFAULT_TLOG: ITreasuryLog = {
  id: 0, title: 'Novo movimento de tesouraria', date: Date.now(), value: 0, cat: 0, subcat: 0, type: 'expense', obs: '', recurrencyid: 0, nif: false, efat: 0, efatcheck: false
}

@Component({
  selector: 'mhq-new-treasury-log',
  templateUrl: './new-treasury-log.component.html',
  styleUrls: ['../../../../../shared/styles/mhq-mainform-details.scss']
})

export class NewTreasuryLogComponent implements OnInit {
  firstLoadingComplete: boolean;

  tempTLog: ITreasuryLog;

  tLogDatepicker: MatDatepicker<any>;   // datepickers
  tLogDatepickerForm: FormControl<any>; // datepickers

  catForm: FormControl                  // autocomplete categoria
  catList: SelectEnum[] = [];    // autocomplete categoria

  subcatForm: FormControl               // autocomplete sub categoria
  subcategoriesList: SelectEnum[] = []; // autocomplete sub categoria

  efatForm: FormControl                 // autocomplete efatura
  efatsList: SelectEnum[] = [];         // autocomplete efatura

  recurrency: boolean   // recorrencia
  recurrencyType: string;
  recurrencyFrequency: FormControl<any>;
  saveComplete: boolean;


  constructor(private _errorHandlingService: ErrorHandlingService, public categoriesService: CategoriesService, public treasuryService: TreasuryService, private _router: Router, private _http: HttpClient, private _timerService: TimerService, private _categoriesSnackBarService: MHQSnackBarsService, public loadingService: LoadingService, public efaturaService: EfaturaService) {
    this.saveComplete = true;
    this.recurrency = false;
  }

  ngOnInit(): void {

    this.treasuryService.onInitTrigger.subscribe(x => { this.ngOnInit(); }); this.categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this.loadingService.categoriesLoadingComplete || !this.loadingService.treasuryLoadingComplete || this.firstLoadingComplete) { return }     // loading check
    this.firstLoadingComplete = true;

    if (this.treasuryService.cloningTLog) {
      this.tempTLog = JSON.parse(JSON.stringify(this.treasuryService.activeTLog));
      this.tempTLog.id = 0;
      this.tempTLog.efatcheck = false;
      this.treasuryService.recordBorderStyle['background-color'] = this.categoriesService.catTable[`'${this.tempTLog.cat}'`].bgcolor
      this.catForm = new FormControl(this.tempTLog.cat, [Validators.required]);
      this.subcatForm = new FormControl(this.tempTLog.subcat, [Validators.required]);
      this.efatForm = new FormControl(this.tempTLog.efat, [Validators.required]);
      this.refreshSubcategoryList(this.tempTLog.cat);
    } else {
      this.tempTLog = JSON.parse(JSON.stringify(DEFAULT_TLOG))
      this.treasuryService.recordBorderStyle['background-color'] = 'rgb(0,0,0)';
      this.catForm = new FormControl({ value: '', disabled: false }, [Validators.required]);
      this.subcatForm = new FormControl({ value: '', disabled: true }, [Validators.required]);
      this.efatForm = new FormControl({ value: 0, disabled: true }, [Validators.required]);
    }

    this.tLogDatepickerForm = new FormControl(new Date(this.tempTLog.date), [Validators.required]);

    this.efatsList = [];
    for (let i = 0; i < Object.keys(this.efaturaService.efaturaTable).length; i++) { this.efatsList.push({ title: this.efaturaService.efaturaTable[i].title, value: i }) }

    this.catList = [];
    for (let i = 0; i < Object.keys(this.categoriesService.catTable).length; i++) {
      this.catList.push({
        title: this.categoriesService.catTable[Object.keys(this.categoriesService.catTable)[i]].title,
        value: this.categoriesService.catTable[Object.keys(this.categoriesService.catTable)[i]].id
      })
    }

    this.recurrencyFrequency = new FormControl({ value: '', disabled: true }, [Validators.required, Validators.min(2)]);
  }

  tLogRecordActions(action: RecordActions): void {
    switch (action) {
      case 'save':
        if (this.catForm.errors || this.subcatForm.errors || this.subcatForm.value === '' || this.subcatForm.disabled) { return this._categoriesSnackBarService.triggerMHQSnackbar(false, 'warning_amber', 'categoria/sub-categoria', ['O par ', ' não se encontra definido.']) }
        if (!this.recurrencyFrequency.disabled && !this.recurrencyFrequency.valid) { return this._categoriesSnackBarService.triggerMHQSnackbar(false, 'warning_amber', 'recorrências', ['As ', ' não se encontram bem definidas.']) }

        this.tempTLog.date = this.tLogDatepickerForm.value.getTime();
        this.tempTLog.cat = this.catForm.value;
        this.tempTLog.subcat = this.subcatForm.value;
        this.tempTLog.efat = this.efatForm.value;
        this.tempTLog.value = Number(this.tempTLog.value.toString().replace(',', '.'))
        if (!this.tempTLog.value.toString().match(/^[0-9]*\.?[0-9]{0,2}$/g)) { return this._categoriesSnackBarService.triggerMHQSnackbar(false, 'warning_amber', 'Valor', ['O campo ', ' encontra-se incorretamente definido.']); }
        this.createTLog();
        break;

      case 'cancel': default:
        document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight');
        this._timerService.timer = setTimeout(() => { this._router.navigate(['/fi/tlogs']); }, 750);
    }
  }

  createTLog(): void {
    const RECURRENCY_OPTIONS: RecurrencyOptions = {
      active: this.recurrency,
      type: this.recurrencyType,
      freq: this.recurrencyFrequency.value,
      date: new Date(this.tempTLog.date).getDate()
    }
    const HTTP_PARAMS = new HttpParams().set('tlog', JSON.stringify(this.tempTLog)).set('recurrency', JSON.stringify(RECURRENCY_OPTIONS));
    const CALL = this._http.post('http://localhost:16190/createtreasurylog', HTTP_PARAMS, { responseType: 'json' });
    // const CALL = this._http.post('http://localhost/hq/php/tlogs/newtlog.php', HTTP_PARAMS, { responseType: 'json' });

    this.saveComplete = false;

    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as string[];
        // return;
        if (RESP[0] !== 'MHQERROR') {
          // this.treasuryService.recordBorderStyle['background-color'] = this.categoriesService.catTable[`'${this.tempTLog.cat}'`].bgcolor
          this.treasuryService.fetchTreasuryLog('saveTLog', Number(RESP[0]));
          this._categoriesSnackBarService.triggerMHQSnackbar(true, 'playlist_add', '', [RESP[1], '']);
          this.saveComplete = true;
        } else {
          this._categoriesSnackBarService.triggerMHQSnackbar(false, 'warning_amber', '', [RESP[1], '']);
        }

      },
      error: err => {
        this._errorHandlingService.handleError(err);
      }
    })
  }

  refreshSubcategoryList(catID: number): void {
    this.subcategoriesList = [];
    this.categoriesService.catTable[`'${catID}'`].subcats.forEach((subcat: IFinancialSubCategory) => { this.subcategoriesList.push({ title: subcat.title, value: subcat.id }) });
  }

  catChanged(event: MatSelectChange): void {
    this.refreshSubcategoryList(event.value);
    this.subcatForm.setValue('');
    Object.keys(this.subcategoriesList).length > 0 ? this.subcatForm.enable() : this.subcatForm.disable();
  }

  nifStatus(event: MatCheckboxChange): void { event.checked ? this.efatForm.enable() : this.efatForm.disable() };
  recurrencyToggle(event: MatSlideToggleChange): void { event.checked ? this.recurrencyFrequency.enable() : this.recurrencyFrequency.disable(); };
}
