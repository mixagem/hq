import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { CategoriesService } from '../../categories/categories.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { TreasuryService } from '../treasury.service';
import { ErrorHandlingService, LoadingService } from 'src/assets/services/misc.service';
import { MatSelectChange } from '@angular/material/select';
import { MHQSnackBarsService } from 'src/assets/services/mhq-snackbar.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DeleteTreasauryLogModalComponent } from './delete-treasaury-log-modal/delete-treasaury-log-modal.component';
import { UpdateRecurrencyModalComponent } from './update-recurrency-modal/update-recurrency-modal.component';
import { DettachRecurrencyModalComponent } from './dettach-recurrency-modal/dettach-recurrency-modal.component';
import { EfaturaService } from '../../efatura/efatura.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { IFinancialSubCategory } from 'src/assets/interfaces/ifinancial-sub-category';
import { CheckTreasuryEfatComponent } from './check-treasury-efat/check-treasury-efat.component';

type SelectEnum = { title: string, value: number }
type RecordActions = 'edit' | 'save' | 'cancel'

@Component({
  selector: 'mhq-treasury-details',
  templateUrl: './treasury-details.component.html',
  styleUrls: ['../../../../../assets/styles/mhq-mainform-details.scss']
})

export class TreasuryDetailsComponent implements OnInit {
  firstLoadingComplete: boolean;

  id: number;             // id do movimento em consulta
  tLog: ITreasuryLog;     // clone do movimento utilizado no modo de consulta
  tempTLog: ITreasuryLog; // clone do movimento utilizado no modo edição
  editingMode: boolean;   // boolean com o estado do modo de edição

  tLogDatepicker: MatDatepicker<any>;   // datepickers
  tLogDatepickerForm: FormControl<any>; // datepickers

  catForm: FormControl                  // autocomplete categoria
  catList: SelectEnum[] = [];    // autocomplete categoria

  subcatForm: FormControl               // autocomplete sub categoria
  subcategoriesList: SelectEnum[] = []; // autocomplete sub categoria

  efatForm: FormControl                 // autocomplete efatura
  efatsList: SelectEnum[] = [];         // autocomplete efatura

  recurrency: boolean                     // recorrencia
  recurrencyType: string;                 // recorrencia
  recurrencyFrequency: FormControl<any>;  // recorrencia
  recurrencyFamily: ITreasuryLog[];       // recorrencia

  constructor(private _loadingService: LoadingService, private _errorHandlingService: ErrorHandlingService, private _route: ActivatedRoute, public treasuryService: TreasuryService, private _dialog: MatDialog, private _http: HttpClient, public categoriesService: CategoriesService, private _categoriesSnackBarService: MHQSnackBarsService, private _router: Router, public efaturaService: EfaturaService) {
    this.editingMode = false;
    this.firstLoadingComplete = false;
    this.recurrencyFamily = [];
  }

  ngOnInit(): void {

    this.treasuryService.onInitTrigger.subscribe(x => { this.ngOnInit(); }); this.categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this._loadingService.categoriesLoadingComplete || !this._loadingService.treasuryLoadingComplete || this.firstLoadingComplete) { return }
    this.firstLoadingComplete = true;

    this.id = Number(this._route.snapshot.paramMap.get('id'))!;
    this.tLog = this.treasuryService.tLogTable[`'${this.id}'`];
    this.tempTLog = JSON.parse(JSON.stringify(this.tLog));
    this.treasuryService.activeTLog = JSON.parse(JSON.stringify(this.tLog));
    this.getRecurrencyFamily();

    this.tLogDatepickerForm = new FormControl(new Date(this.tLog.date), [Validators.required]);

    this.catList = [];
    for (let i = 0; i < Object.keys(this.categoriesService.catTable).length; i++) { this.catList.push({ title: this.categoriesService.catTable[Object.keys(this.categoriesService.catTable)[i]].title, value: this.categoriesService.catTable[Object.keys(this.categoriesService.catTable)[i]].id }) }
    this.catForm = new FormControl(this.tempTLog.cat, [Validators.required]);

    this.subcategoriesList = [];
    this.categoriesService.catTable[`'${this.tempTLog.cat}'`].subcats.forEach((subcat: { title: string; id: number }) => { this.subcategoriesList.push({ title: subcat.title, value: subcat.id }) });
    this.subcatForm = new FormControl({ value: this.tempTLog.subcat, disabled: false }, [Validators.required]);

    this.efatsList = [];
    for (let i = 0; i < Object.keys(this.efaturaService.efaturaTable).length; i++) { this.efatsList.push({ title: this.efaturaService.efaturaTable[i].title, value: i }) }
    this.efatForm = new FormControl({ value: this.tempTLog.efat, disabled: !this.tempTLog.nif || this.tempTLog.efatcheck }, [Validators.required]);

    this.treasuryService.recordBorderStyle['background-color'] = this.categoriesService.catTable[`'${this.tLog.cat}'`].bgcolor;
  }

  getRecurrencyFamily(): void {
    if (this.tempTLog.recurrencyid === 0) { return }
    const HTTP_PARAMS = new HttpParams().set('type', 'tlog').set('tlogID', this.tempTLog.id).set('recurID', this.tempTLog.recurrencyid)
    const CALL = this._http.post('http://localhost:16190/getrecurencylogs', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const ERROR_CODE = codeReceived as string[];
        if(ERROR_CODE[0]==='MHQERROR'){
          return this._categoriesSnackBarService.triggerMHQSnackbar(false, 'warning_amber', '', [ERROR_CODE[1], '']);
        }
        const RESP = codeReceived as ITreasuryLog[];
        console.log(RESP)
        this.recurrencyFamily = RESP
      },
      error: err => {
        this._errorHandlingService.handleError(err);
      }
    })
  }

  saveTLog(): void {
    const HTTP_PARAMS = new HttpParams().set('type', 'tlog').set('tlog', JSON.stringify(this.tempTLog))
    const CALL = this._http.post('http://localhost:16190/updatetreasurylog', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as string[];
        if (RESP[0] !== 'MHQERROR') {
          this.treasuryService.fetchTreasuryLog('saveTLog', this.id);
          this.editingMode = false;
          this._categoriesSnackBarService.triggerMHQSnackbar(true, 'save_as', '', [RESP[0], '']);
        }
        else {
          this._categoriesSnackBarService.triggerMHQSnackbar(false, 'warning_amber', '', [RESP[1], '']);
        }
      },
      error: err => {
        this._errorHandlingService.handleError(err);
      }
    })
  }

  tLogRecordActions(action: RecordActions): void {
    switch (action) {
      case 'edit':
        this.tempTLog = JSON.parse(JSON.stringify(this.tLog));
        this.refreshSubcategoryList(this.tempTLog.cat);
        this.catForm = new FormControl(this.tempTLog.cat, [Validators.required]);
        this.subcatForm = new FormControl(this.tempTLog.subcat, [Validators.required]);
        Object.keys(this.subcategoriesList).length > 0 ? this.subcatForm.enable() : this.subcatForm.disable();
        this.editingMode = true;
        break;

      case 'save':
        if (this.catForm.errors || this.subcatForm.errors || this.subcatForm.value === '' || this.subcatForm.disabled) { return this._categoriesSnackBarService.triggerMHQSnackbar(false, 'warning_amber', 'categoria/sub-categoria', ['O par ', 'não se encontra definido.']) }
        this.tempTLog.date = this.tLogDatepickerForm.value.getTime();
        this.tempTLog.cat = this.catForm.value;
        this.tempTLog.subcat = this.subcatForm.value;
        this.tempTLog.efat = this.efatForm.value;
        this.treasuryService.recordBorderStyle['background-color'] = this.categoriesService.catTable[`'${this.catForm.value}'`].bgcolor;

        this.tempTLog.value = Number(this.tempTLog.value.toString().replace(',', '.')); // conversão de vírgulas para pontos
        if (!this.tempTLog.value.toString().match(/^[0-9]*\.?[0-9]{0,2}$/g)) { return this._categoriesSnackBarService.triggerMHQSnackbar(false, 'warning_amber', 'Valor', ['O campo ', ' encontra-se incorretamente definido.']); }

        if (this.tempTLog.recurrencyid === 0) { this.saveTLog(); }

        else {
          this.treasuryService.activeTLog = this.tempTLog;
          this.updateRecurrencyModal('300ms', '150ms');
        }
        break;

      case 'cancel': default:
        this.treasuryService.activeTLog = JSON.parse(JSON.stringify(this.tLog)); // quando cancelamos, é preciso resetar as alteraçõs feitas
        this.editingMode = false;
    }
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

  deleteTLogModal(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this._dialog.open(DeleteTreasauryLogModalComponent, { width: '600px', height: '300px', enterAnimationDuration, exitAnimationDuration, });
  }

  efatCheckModal(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this._dialog.open(CheckTreasuryEfatComponent, { width: '600px', height: '300px', enterAnimationDuration, exitAnimationDuration, });
  }

  updateRecurrencyModal(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.treasuryService.activeTLog = this.tempTLog;
    this._dialog.open(UpdateRecurrencyModalComponent, { width: '640px', height: '450px', enterAnimationDuration, exitAnimationDuration, });
  }

  dettachRecurrencyModal(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.treasuryService.activeTLog = this.tempTLog;
    this._dialog.open(DettachRecurrencyModalComponent, { width: '640px', height: '320px', enterAnimationDuration, exitAnimationDuration });
  }

  nifStatus(event: MatCheckboxChange): void { event.checked ? this.efatForm.enable() : this.efatForm.disable() };
  recurrencyToggle(event: MatSlideToggleChange): void { event.checked ? this.recurrencyFrequency.enable() : this.recurrencyFrequency.disable(); };
  viewMode(logID: number): void { this._router.navigateByUrl('/fi/tlogs', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/tlogs', logID]); }); };
  getTlogDateLocale(date: number): string { return new Date(date).toLocaleDateString('pt') };
}