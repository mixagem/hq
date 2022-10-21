import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { CategoriesService } from '../../categories/categories.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { TreasuryService } from '../treasury.service';
import { ErrorHandlingService, MiscService } from 'src/assets/services/misc.service';
import { MatSelectChange } from '@angular/material/select';
import { CategorySnackBarsService } from 'src/assets/services/snack-bars.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { ThemePalette } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

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

  constructor(private _errorHandlingService: ErrorHandlingService, private _route: ActivatedRoute, public treasuryService: TreasuryService, private _dialog: MatDialog, private _http: HttpClient, private _categoriesService: CategoriesService, public miscService: MiscService, private _categoriesSnackBarService: CategorySnackBarsService, private _router: Router) {
    this.editingMode = false;
    this.recurrencyFamily = [];
  }

  ngOnInit(): void {
    this.id = Number(this._route.snapshot.paramMap.get('id')!);
    this.treasuryLog = this.miscService.getTreasuryLog(this.id)
    this.tempTreasuryLog = JSON.parse(JSON.stringify(this.treasuryLog));
    this.treasuryService.activeTreasuryLog = JSON.parse(JSON.stringify(this.treasuryLog));
    this.treasuryLogDatepickerForm = new FormControl(new Date(this.treasuryLog.date), [Validators.required]);
    this.catForm = new FormControl(this.miscService.getCategory(this.tempTreasuryLog.cat).title, [Validators.required]);
    this.subcatForm = new FormControl({ value: this.miscService.getSubcategory(this.tempTreasuryLog.cat, this.tempTreasuryLog.subcat).title, disabled: true }, [Validators.required]);
    this.miscService.getCategory(this.tempTreasuryLog.cat).subcats.forEach(subcat => { this.subcategoriesList.push(subcat.title) });
    this.subcatForm.enable();
    this._categoriesService.allCategories.forEach(cat => { this.categoriesList.push(cat.title) });
    this.getRecurrencyFamily();
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
        this._categoriesSnackBarService.triggerCategoriesSnackbar(true, 'save_as', this.tempTreasuryLog.title, ['O movimento ', ' foi atualizado com sucesso.']);
      },
      error: err => {
        this._errorHandlingService.handleError(err);
        this._categoriesSnackBarService.triggerCategoriesSnackbar(false, 'report', this.tempTreasuryLog.title, ['Ocurreu algo inesperado ao atualizar o movimento ', '.']);
      }
    })
  }

  openMissingCategoriesSnackBar(): void {
    this._categoriesSnackBarService.triggerCategoriesSnackbar(false, 'report', 'categoria/sub-categoria', ['O par ', 'não se encontra definido.'])
  }

  editingTreasuryLogRecordActions(action: string): void {
    switch (action) {
      case 'start':
        this.tempTreasuryLog = JSON.parse(JSON.stringify(this.treasuryLog));
        this.refreshSubcategoryList(this.tempTreasuryLog.cat);
        this.catForm = new FormControl(this.miscService.getCategory(this.tempTreasuryLog.cat).title, [Validators.required]);
        this.subcatForm = new FormControl(this.miscService.getSubcategory(this.tempTreasuryLog.cat, this.tempTreasuryLog.subcat).title, [Validators.required]);
        this.subcategoriesList.length > 0 ? this.subcatForm.enable() : this.subcatForm.disable();
        this.editingMode = true;
        break;

      case 'save':
        if (this.catForm.errors || this.subcatForm.errors || this.subcatForm.value === '' || this.subcatForm.disabled) { return this.openMissingCategoriesSnackBar(); }
        const CATEGORY = this.miscService.getCategoryFromTitle(this.catForm.value);
        this.tempTreasuryLog.date = this.treasuryLogDatepickerForm.value.getTime();
        this.tempTreasuryLog.cat = CATEGORY.id;
        this.tempTreasuryLog.subcat = this.miscService.getSubcategoryFromTitle(CATEGORY.subcats, this.subcatForm.value).id;
        this.treasuryService.recordBorderStyle['background-color'] = CATEGORY.bgcolor;
        this.tempTreasuryLog.value = Number(this.tempTreasuryLog.value.toString().replace(',', '.')); // conversão de vírgulas para pontos
        if (!this.tempTreasuryLog.value.toString().match(/^[0-9]*\.?[0-9]{0,2}$/g)) {
          return this._categoriesSnackBarService.triggerCategoriesSnackbar(false, 'report', 'Valor', ['O campo ', ' encontra-se incorretamente definido.']);
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
      width: '580px',
      height: '220px',
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

  refreshSubcategoryList(catID: number = 0, catTitle: string = ''): void {
    let category: IFinancialCategory;
    if (catID !== 0) { category = this.miscService.getCategory(catID); }
    if (catTitle !== '') { category = this.miscService.getCategoryFromTitle(catTitle); }
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
    this.treasuryService.recordBorderStyle = { "background-color": this.miscService.getCategoryStyles(catID)['background-color'] };
    this._router.navigateByUrl('/fi/tlogs', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/tlogs', logID]); });
  }



}


////////////////////////////////////////



@Component({
  selector: 'delete-tlog-confirmation-modal',
  templateUrl: './delete-tlog-confirmation-modal.html',
  styleUrls: ['../../../../../assets/styles/mhq-large-modal.scss']
})

export class DeleteTreasuryLogConfirmationModal {

  constructor(public treasuryService: TreasuryService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService) { }

  deleteTreasuryLog(): void {
    const HTTP_PARAMS = new HttpParams().set('tlog', this.treasuryService.activeTreasuryLog.id)
    const CALL = this._http.post('http://localhost:16190/deletetreasurylog', HTTP_PARAMS, { responseType: 'text' })

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
  templateUrl: './update-recurrency-confirmation-modal.html',
  styleUrls: ['../../../../../assets/styles/mhq-large-modal.scss']
})

// preciso do temporario

export class UpdateRecurrencyLogConfirmationModal {

  recurrencyOptions: RecurrencyOptions;
  allRecurrencyOptions: boolean = false;

  constructor(public treasuryService: TreasuryService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService, private _categoriesSnackBarService: CategorySnackBarsService) {
    this.allRecurrencyOptions = false;

    this.recurrencyOptions = {
      name: 'Opções a alterar',
      toChange: false,
      color: 'primary',
      options: [
        {
          name: 'Título',
          toChange: false,
          color: 'primary'
        },
        {
          name: 'Valor',
          toChange: false,
          color: 'primary'
        }
      ]
    }
  }

  updateRecurrencyStatus() {
    this.allRecurrencyOptions = this.recurrencyOptions.options != null && this.recurrencyOptions.options.every(option => option.toChange);
  }
  getRecurrencyOptionsStatus () {
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
        this._categoriesSnackBarService.triggerCategoriesSnackbar(true, 'save_as', this.treasuryService.recurrenyTempTlog.title, ['O movimento ', ' e respetivas recorrências, foram atualizadas com sucesso.']);
      },
      error: err => {
        this._errorHandlingService.handleError(err);
        const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
        this._categoriesSnackBarService.triggerCategoriesSnackbar(false, 'report', this.treasuryService.recurrenyTempTlog.title, ['Ocurreu algo inesperado ao atualizar as recorrências para o movimento ', '.']);
      }
    })
  }
}


