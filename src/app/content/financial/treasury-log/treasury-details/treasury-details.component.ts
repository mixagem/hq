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
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'mhq-treasury-details',
  templateUrl: './treasury-details.component.html',
  styleUrls: ['../../../../../assets/styles/mhq-mainform-details.scss']
})

export class TreasuryDetailsComponent implements OnInit {
  treasuryLogDatepicker: MatDatepicker<any>;   // datepickers
  treasuryLogDatepickerForm: FormControl<any>;
  catForm: FormControl   // autocomplete categoria
  categoriesList: string[] = [];
  subcatForm: FormControl  // autocomplete sub categoria
  subcategoriesList: string[] = [];
  id: number;   // id do movimento em consulta
  treasuryLog: ITreasuryLog;   // clone do movimento utilizada em consulta
  tempTreasuryLog: ITreasuryLog;  // clone do moviment utilizada no modo edição
  editingMode: boolean;  // boolean com o estado do modo de edição
  recurrency: boolean  // recorrencia
  recurrencyType: string;
  recurrencyFrequency: FormControl<any>;
  recurrencyFamily: ITreasuryLog[];

  constructor(public loadingService:LoadingService, private _errorHandlingService: ErrorHandlingService, private _route: ActivatedRoute, public treasuryService: TreasuryService, private _dialog: MatDialog, private _http: HttpClient, public categoriesService: CategoriesService, private _categoriesSnackBarService: MHQSnackBarsService, private _router: Router) {
    this.editingMode = false;
    this.recurrencyFamily = [];
  }

  ngOnInit(): void {    // triggers remoto do OnInit
    this.categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this.loadingService.categoriesLoadingComplete || !this.loadingService.treasuryLoadingComplete) { return }     // loading check
    this.id = Number(this._route.snapshot.paramMap.get('id')!);
    this.treasuryLog = this.treasuryService.tlogEnum[this.id]
    this.tempTreasuryLog = JSON.parse(JSON.stringify(this.treasuryLog));
    this.treasuryService.activeTreasuryLog = JSON.parse(JSON.stringify(this.treasuryLog));
    this.treasuryLogDatepickerForm = new FormControl(new Date(this.treasuryLog.date), [Validators.required]);
    this.catForm = new FormControl(this.categoriesService.catEnum[this.tempTreasuryLog.cat].title, [Validators.required]);
    this.subcatForm = new FormControl({ value: this.categoriesService.subcatEnum[this.tempTreasuryLog.subcat].title, disabled: true }, [Validators.required]);
    this.categoriesService.catEnum[this.tempTreasuryLog.cat].subcats.forEach((subcat: { title: string; }) => { this.subcategoriesList.push(subcat.title) });
    this.subcatForm.enable();
    this.categoriesService.allCategories.forEach(cat => { this.categoriesList.push(cat.title) });
    console.log('sdas')
    this.getRecurrencyFamily();
    this.treasuryService.recordBorderStyle['background-color'] = this.categoriesService.catEnum[this.treasuryLog.cat].bgcolor;
  }

  getRecurrencyFamily(): void {
    if (this.tempTreasuryLog.recurrencyid === 0) { return }
    const HTTP_PARAMS = new HttpParams().set('tlogID', this.tempTreasuryLog.id).set('recurID', this.tempTreasuryLog.recurrencyid)
    const CALL = this._http.post('http://localhost:16190/getrecurencylogs', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as ITreasuryLog[];
        this.recurrencyFamily = RESP
      },
      error: err => {
        this._errorHandlingService.handleError(err);
      }
    })
  }

  getTlogDateLocale(date: number): string {
    return new Date(date).toLocaleDateString('pt')
  }

  saveTreasurylog(): void {
    const HTTP_PARAMS = new HttpParams().set('tlog', JSON.stringify(this.tempTreasuryLog))
    const CALL = this._http.post('http://localhost:16190/updatetreasurylog', HTTP_PARAMS, { responseType: 'text' })

    CALL.subscribe({
      next: codeReceived => {
        this.treasuryService.fetchTreasuryLog('saveTreasuryLog', this.tempTreasuryLog.id);
        this.editingMode = false;
        this._categoriesSnackBarService.triggerMHQSnackbar(true, 'save_as', this.tempTreasuryLog.title, ['O movimento ', ' foi atualizado com sucesso.']);
      },
      error: err => {
        this._errorHandlingService.handleError(err);
        this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', this.tempTreasuryLog.title, ['Ocurreu algo inesperado ao atualizar o movimento ', '.']);
      }
    })
  }

  openMissingCategoriesSnackBar(): void {
    this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', 'categoria/sub-categoria', ['O par ', 'não se encontra definido.'])
  }

  editingTreasuryLogRecordActions(action: string): void {
    switch (action) {
      case 'start':
        this.tempTreasuryLog = JSON.parse(JSON.stringify(this.treasuryLog));
        this.refreshSubcategoryList(this.tempTreasuryLog.cat);
        this.catForm = new FormControl(this.categoriesService.catEnum[this.tempTreasuryLog.cat].title, [Validators.required]);
        this.subcatForm = new FormControl(this.categoriesService.subcatEnum[this.tempTreasuryLog.subcat].title, [Validators.required]);
        this.subcategoriesList.length > 0 ? this.subcatForm.enable() : this.subcatForm.disable();
        this.editingMode = true;
        break;

      case 'save':
        if (this.catForm.errors || this.subcatForm.errors || this.subcatForm.value === '' || this.subcatForm.disabled) { return this.openMissingCategoriesSnackBar(); }
        const CATEGORY = this.categoriesService.catTitleEnum[`${this.catForm.value}`];
        this.tempTreasuryLog.date = this.treasuryLogDatepickerForm.value.getTime();
        this.tempTreasuryLog.cat = CATEGORY.id;
        this.tempTreasuryLog.subcat = this.categoriesService.subcatTitleEnum[`${this.subcatForm.value}`].id;
        this.tempTreasuryLog.value = Number(this.tempTreasuryLog.value.toString().replace(',', '.')); // conversão de vírgulas para pontos
        if (!this.tempTreasuryLog.value.toString().match(/^[0-9]*\.?[0-9]{0,2}$/g)) {
          return this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', 'Valor', ['O campo ', ' encontra-se incorretamente definido.']);
        }

        if (this.tempTreasuryLog.recurrencyid === 0) {
          this.saveTreasurylog();
        }
        if (this.tempTreasuryLog.recurrencyid !== 0) {
          this.treasuryService.recurrenyTempTlog = this.tempTreasuryLog;
          this.openDialog2('300ms', '150ms')
        }
        break;

      case 'end': default:
        this.editingMode = false;
    }
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this._dialog.open(DeleteTreasuryLogConfirmationModal, {
      width: '600px',
      height: '300px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  openDialog2(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this._dialog.open(UpdateRecurrencyLogConfirmationModal, {
      width: '640px',
      height: '320px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  openDialog3(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.treasuryService.recurrenyTempTlog = this.tempTreasuryLog;
    this._dialog.open(DettachRecurrencyConfirmationModal, {
      width: '640px',
      height: '320px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
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

  viewMode(logID: number, catID: number): void {
    this._router.navigateByUrl('/fi/tlogs', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/tlogs', logID]); });
  }
}


////////////////////////////////////////


@Component({
  selector: 'dettach-recurrency-confirmation-modal',
  templateUrl: './modals/dettach-recurrency-confirmation-modal.html',
  styleUrls: ['../../../../../assets/styles/mhq-modal.scss']
})

export class DettachRecurrencyConfirmationModal {

  constructor(public treasuryService: TreasuryService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService, private _categoriesSnackBarService: MHQSnackBarsService) { }

  dettachFromRecurrency(): void {
    const HTTP_PARAMS = new HttpParams().set('tlog', JSON.stringify(this.treasuryService.recurrenyTempTlog))
    const CALL = this._http.post('http://localhost:16190/dettachrecurrency', HTTP_PARAMS, { responseType: 'text' })

    CALL.subscribe({
      next: codeReceived => {
        this.treasuryService.fetchTreasuryLog('saveTreasuryLog', this.treasuryService.recurrenyTempTlog.id);
        const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
        this._categoriesSnackBarService.triggerMHQSnackbar(true, 'save_as', this.treasuryService.recurrenyTempTlog.title, ['O movimento ', ' foi removido da recorrência com sucesso.']);
      },
      error: err => {
        this._errorHandlingService.handleError(err);
        const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
        this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', this.treasuryService.recurrenyTempTlog.title, ['Ocurreu algo inesperado ao atualizar o movimento ', '.']);
      }
    })
  }
}

////////////////////////////////////////


@Component({
  selector: 'delete-tlog-confirmation-modal',
  templateUrl: './modals/delete-tlog-confirmation-modal.html',
  styles: ['.mhq-modal-header{background-color: var(--mhq-waikiki-danger)!important;}'],
  styleUrls: ['../../../../../assets/styles/mhq-modal.scss']
})

export class DeleteTreasuryLogConfirmationModal {
  haveRecurrency: boolean;

  constructor(public treasuryService: TreasuryService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService) {
    this.haveRecurrency = this.treasuryService.activeTreasuryLog.recurrencyid !== 0
  }

  deleteTreasuryLog(): void {
    const HTTP_PARAMS = new HttpParams().set('tlog', this.treasuryService.activeTreasuryLog.id)
    const CALL = this._http.post('http://localhost:16190/deletetreasurylog', HTTP_PARAMS, { responseType: 'text' })

    CALL.subscribe({
      next: codeReceived => { this.treasuryService.fetchTreasuryLog('deleteTreasuryLog'); },
      error: err => this._errorHandlingService.handleError(err)
    })
  }

  deleteAllRecurrencies(): void {
    const HTTP_PARAMS = new HttpParams().set('recurrencyID', this.treasuryService.activeTreasuryLog.recurrencyid)
    const CALL = this._http.post('http://localhost:16190/deleteallrecurrencies', HTTP_PARAMS, { responseType: 'text' })

    CALL.subscribe({
      next: codeReceived => { this.treasuryService.fetchTreasuryLog('deleteTreasuryLog'); },
      error: err => this._errorHandlingService.handleError(err)
    })
  }
}


////////////////////////////////////////

export type RecurrencyOptions = {
  name: string;
  toChange: boolean;
  color: ThemePalette;
  options?: RecurrencyOptions[];
}

@Component({
  selector: 'update-recurrency-confirmation-modal',
  templateUrl: './modals/update-recurrency-confirmation-modal.html',
  styleUrls: ['../../../../../assets/styles/mhq-modal.scss']
})

export class UpdateRecurrencyLogConfirmationModal {
  recurrencyOptions: RecurrencyOptions;
  allRecurrencyOptions: boolean = false;

  constructor(public treasuryService: TreasuryService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService, private _categoriesSnackBarService: MHQSnackBarsService) {
    this.allRecurrencyOptions = false;
    this.recurrencyOptions = {
      name: 'Opções a alterar', toChange: false, color: 'primary', options: [
        { name: 'Título', toChange: false, color: 'primary' },
        { name: 'Valor', toChange: false, color: 'primary' }
      ]
    }
  }

  updateRecurrencyStatus() {
    this.allRecurrencyOptions = this.recurrencyOptions.options != null && this.recurrencyOptions.options.every(option => option.toChange);
  }
  getRecurrencyOptionsStatus() {
    if (this.recurrencyOptions.options == null) {
      return false;
    }
    return this.recurrencyOptions.options.filter(option => option.toChange).length > 0 && !this.allRecurrencyOptions;
  }

  wantAllRecurrencyOptions(toChange: boolean) {
    this.allRecurrencyOptions = toChange;
    if (this.recurrencyOptions.options == null) {
      return;
    }
    this.recurrencyOptions.options.forEach(option => (option.toChange = toChange));
  }

  recurrencyUpdate(update: boolean): void {

    const HTTP_PARAMS = new HttpParams().set('tlog', JSON.stringify(this.treasuryService.recurrenyTempTlog))

    let call;
    if (update) { call = this._http.post('http://localhost:16190/updaterecurrency', HTTP_PARAMS, { responseType: 'text' }) }
    else { call = this._http.post('http://localhost:16190/updatetreasurylog', HTTP_PARAMS, { responseType: 'text' }) }

    call.subscribe({
      next: codeReceived => {
        this.treasuryService.fetchTreasuryLog('saveTreasuryLog', this.treasuryService.recurrenyTempTlog.id);
        const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
        this._categoriesSnackBarService.triggerMHQSnackbar(true, 'save_as', this.treasuryService.recurrenyTempTlog.title, ['O movimento ', ' e respetivas recorrências, foram atualizadas com sucesso.']);
      },
      error: err => {
        this._errorHandlingService.handleError(err);
        const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
        this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', this.treasuryService.recurrenyTempTlog.title, ['Ocurreu algo inesperado ao atualizar as recorrências para o movimento ', '.']);
      }
    })
  }
}


