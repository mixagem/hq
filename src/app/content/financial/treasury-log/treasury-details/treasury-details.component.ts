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
import { DeleteTreasauryLogModalComponent } from './delete-treasaury-log-modal/delete-treasaury-log-modal.component';
import { UpdateRecurrencyModalComponent } from './update-recurrency-modal/update-recurrency-modal.component';
import { DettachRecurrencyModalComponent } from './dettach-recurrency-modal/dettach-recurrency-modal.component';
import { EfaturaService } from '../../efatura/efatura.service';

type SelectEnum = { title: string, value: number }

@Component({
  selector: 'mhq-treasury-details',
  templateUrl: './treasury-details.component.html',
  styleUrls: ['../../../../../assets/styles/mhq-mainform-details.scss']
})

export class TreasuryDetailsComponent implements OnInit {
  firstLoadingComplete: Boolean;

  treasuryLogDatepicker: MatDatepicker<any>;   // datepickers
  treasuryLogDatepickerForm: FormControl<any>; // datepickers

  catForm: FormControl   // autocomplete categoria
  categoriesList: SelectEnum[] = [];// autocomplete categoria

  subcatForm: FormControl  // autocomplete sub categoria
  subcategoriesList: SelectEnum[] = [];// autocomplete sub categoria

  efatForm: FormControl   // autocomplete efatura
  efatsList: SelectEnum[] = [];// autocomplete efatura

  id: string;   // id do movimento em consulta
  tLog: ITreasuryLog;   // clone do movimento utilizada em consulta
  tempTLog: ITreasuryLog;  // clone do moviment utilizada no modo edição
  editingMode: boolean;  // boolean com o estado do modo de edição
  recurrency: boolean  // recorrencia
  recurrencyType: string;// recorrencia
  recurrencyFrequency: FormControl<any>;// recorrencia
  recurrencyFamily: ITreasuryLog[];// recorrencia

  constructor(public loadingService: LoadingService, private _errorHandlingService: ErrorHandlingService, private _route: ActivatedRoute, public treasuryService: TreasuryService, private _dialog: MatDialog, private _http: HttpClient, public categoriesService: CategoriesService, private _categoriesSnackBarService: MHQSnackBarsService, private _router: Router, public efaturaService: EfaturaService) {
    this.editingMode = false;
    this.firstLoadingComplete = false;
    this.recurrencyFamily = [];
  }

  ngOnInit(): void {
    // loading check
    this.treasuryService.onInitTrigger.subscribe(x => { this.ngOnInit(); }); this.categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this.loadingService.categoriesLoadingComplete || !this.loadingService.treasuryLoadingComplete || this.firstLoadingComplete) { return }
    this.firstLoadingComplete = true;

    this.id = this._route.snapshot.paramMap.get('id')!;
    this.tLog = this.treasuryService.tLogTable[`'${this.id}'`];
    this.tempTLog = JSON.parse(JSON.stringify(this.tLog));
    this.treasuryService.activeTLog = JSON.parse(JSON.stringify(this.tLog));

    this.treasuryLogDatepickerForm = new FormControl(new Date(this.tLog.date), [Validators.required]);

    this.categoriesList = [];
    for (let i = 0; i < Object.keys(this.categoriesService.catEnum).length; i++) { this.categoriesList.push({ title: this.categoriesService.catEnum[Object.keys(this.categoriesService.catEnum)[i]].title, value: this.categoriesService.catEnum[Object.keys(this.categoriesService.catEnum)[i]].id }) }
    this.catForm = new FormControl(this.tempTLog.cat, [Validators.required]);

    this.subcategoriesList = [];
    this.categoriesService.catEnum[this.tempTLog.cat].subcats.forEach((subcat: { title: string; id: number }) => { this.subcategoriesList.push({ title: subcat.title, value: subcat.id }) });
    this.subcatForm = new FormControl({ value: this.tempTLog.subcat, disabled: false }, [Validators.required]);

    this.efatsList = [];
    for (let i = 0; i < Object.keys(this.efaturaService.efaturaEnum).length; i++) { this.efatsList.push({ title: this.efaturaService.efaturaEnum[i].title, value: i }) }
    this.efatForm = new FormControl({ value: this.tempTLog.efat, disabled: !this.tempTLog.nif || this.tempTLog.efatcheck }, [Validators.required]);

    this.getRecurrencyFamily();
    this.treasuryService.recordBorderStyle['background-color'] = this.categoriesService.catEnum[this.tLog.cat].bgcolor;
  }

  getRecurrencyFamily(): void {
    if (this.tempTLog.recurrencyid === 0) { return }
    const HTTP_PARAMS = new HttpParams().set('type', 'tlog').set('tlogID', this.tempTLog.id).set('recurID', this.tempTLog.recurrencyid)
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

  saveTreasurylog(): void {
    const HTTP_PARAMS = new HttpParams().set('type', 'tlog').set('tlog', JSON.stringify(this.tempTLog))
    const CALL = this._http.post('http://localhost:16190/updatetreasurylog', HTTP_PARAMS, { responseType: 'text' })

    CALL.subscribe({
      next: codeReceived => {
        this.treasuryService.fetchTreasuryLog('saveTLog', this.tempTLog.id);
        this.editingMode = false;
        this._categoriesSnackBarService.triggerMHQSnackbar(true, 'save_as', this.tempTLog.title, ['O movimento ', ' foi atualizado com sucesso.']);
      },
      error: err => {
        this._errorHandlingService.handleError(err);
        this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', this.tempTLog.title, ['Ocurreu algo inesperado ao atualizar o movimento ', '.']);
      }
    })
  }

  nifStatus(event:any){    event.checked? this.efatForm.enable() : this.efatForm.disable()  }

  editingTreasuryLogRecordActions(action: string): void {
    switch (action) {
      case 'start':
        this.tempTLog = JSON.parse(JSON.stringify(this.tLog));
        this.refreshSubcategoryList(this.tempTLog.cat);
        this.catForm = new FormControl(this.tempTLog.cat, [Validators.required]);
        this.subcatForm = new FormControl(this.tempTLog.subcat, [Validators.required]);
        Object.keys(this.subcategoriesList).length > 0 ? this.subcatForm.enable() : this.subcatForm.disable();
        this.editingMode = true;
        break;

      case 'save':
        if (this.catForm.errors || this.subcatForm.errors || this.subcatForm.value === '' || this.subcatForm.disabled) { return this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', 'categoria/sub-categoria', ['O par ', 'não se encontra definido.']) }
        const CATEGORY = this.categoriesService.catTitleEnum[`${this.catForm.value}`];
        this.tempTLog.date = this.treasuryLogDatepickerForm.value.getTime();
        this.tempTLog.cat = CATEGORY.id;
        this.tempTLog.subcat = this.subcatForm.value;
        this.tempTLog.efat = this.efatForm.value;
        this.treasuryService.recordBorderStyle['background-color'] = CATEGORY.bgcolor;

        this.tempTLog.value = Number(this.tempTLog.value.toString().replace(',', '.')); // conversão de vírgulas para pontos
        if (!this.tempTLog.value.toString().match(/^[0-9]*\.?[0-9]{0,2}$/g)) { return this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', 'Valor', ['O campo ', ' encontra-se incorretamente definido.']); }

        if (this.tempTLog.recurrencyid === 0) { this.saveTreasurylog(); }

        if (this.tempTLog.recurrencyid !== 0) {
          this.treasuryService.activeTLog = this.tempTLog;
          this.updateRecurrencyLogModal('300ms', '150ms')
        }
        break;

      case 'end': default:
        this.editingMode = false;
    }
  }

  refreshSubcategoryList(catID: number): void {

    let category: IFinancialCategory;
    this.subcategoriesList = [];
    category = this.categoriesService.catEnum[catID];
    category.subcats.forEach(subcat => { this.subcategoriesList.push({ title: subcat.title, value: subcat.id }) });
  }

  categorySelectChanged(event: MatSelectChange): void {
    this.refreshSubcategoryList(event.value);
    this.subcatForm.setValue('');
    Object.keys(this.subcategoriesList).length > 0 ? this.subcatForm.enable() : this.subcatForm.disable();
  }

  deleteTreasuryLogModal(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this._dialog.open(DeleteTreasauryLogModalComponent, {
      width: '600px',
      height: '300px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  updateRecurrencyLogModal(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this._dialog.open(UpdateRecurrencyModalComponent, {
      width: '640px',
      height: '320px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  dettachRecurrencyModal(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.treasuryService.activeTLog = this.tempTLog;
    this._dialog.open(DettachRecurrencyModalComponent, {
      width: '640px',
      height: '320px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  recurrencyToggle(event: MatSlideToggleChange): void { event.checked ? this.recurrencyFrequency.enable() : this.recurrencyFrequency.disable(); }

  viewMode(logID: number, catID: number): void { this._router.navigateByUrl('/fi/tlogs', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/tlogs', logID]); }); }

  getTlogDateLocale(date: number): string { return new Date(date).toLocaleDateString('pt') }
}