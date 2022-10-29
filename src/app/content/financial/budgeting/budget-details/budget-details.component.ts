import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { CategoriesService } from '../../categories/categories.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { ErrorHandlingService, LoadingService } from 'src/assets/services/misc.service';
import { MatSelectChange } from '@angular/material/select';
import { MHQSnackBarsService } from 'src/assets/services/mhq-snackbar.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { ThemePalette } from '@angular/material/core';
import { TreasuryService } from '../../treasury-log/treasury.service';
import { BudgetingService } from '../budgeting.service';

@Component({
  selector: 'mhq-budget-details',
  templateUrl: './budget-details.component.html',
  styleUrls: ['./budget-details.component.scss','../../../../../assets/styles/mhq-mainform-details.scss']
})

export class BudgetDetailsComponent implements OnInit {
  budgetLogDatepicker: MatDatepicker<any>;   // datepickers
  budgetLogDatepickerForm: FormControl<any>;
  catForm: FormControl   // autocomplete categoria
  categoriesList: string[] = [];
  subcatForm: FormControl  // autocomplete sub categoria
  subcategoriesList: string[] = [];
  id: number;   // id do movimento em consulta
  budgetLog: ITreasuryLog;   // clone do movimento utilizada em consulta
  tempBudgetLog: ITreasuryLog;  // clone do moviment utilizada no modo edição
  editingMode: boolean;  // boolean com o estado do modo de edição
  recurrency: boolean  // recorrencia
  recurrencyType: string;
  recurrencyFrequency: FormControl<any>;
  recurrencyFamily: ITreasuryLog[];

  constructor(public loadingService:LoadingService, private _errorHandlingService: ErrorHandlingService, private _route: ActivatedRoute, public treasuryService: TreasuryService, private _dialog: MatDialog, private _http: HttpClient, public categoriesService: CategoriesService, private _categoriesSnackBarService: MHQSnackBarsService, private _router: Router, public budgetingService: BudgetingService) {
    this.editingMode = false;
    this.recurrencyFamily = [];
  }

  ngOnInit(): void {
    this.budgetingService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    this.treasuryService.onInitTrigger.subscribe(x => { this.ngOnInit(); });     // triggers remoto do OnInit
    this.categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this.loadingService.categoriesLoadingComplete || !this.loadingService.treasuryLoadingComplete|| !this.loadingService.budgetingLoadingComplete) { return }     // loading check
    this.id = Number(this._route.snapshot.paramMap.get('id')!);
    this.budgetLog = this.budgetingService.budgetEnum[this.id]
    this.tempBudgetLog = JSON.parse(JSON.stringify(this.budgetLog));
    this.budgetingService.activeBudgetLog = JSON.parse(JSON.stringify(this.budgetLog));
    this.budgetLogDatepickerForm = new FormControl(new Date(this.budgetLog.date), [Validators.required]);
    this.catForm = new FormControl(this.categoriesService.catEnum[this.tempBudgetLog.cat].title, [Validators.required]);
    this.subcatForm = new FormControl({ value: this.categoriesService.subcatEnum[this.tempBudgetLog.subcat].title, disabled: true }, [Validators.required]);
    this.categoriesService.catEnum[this.tempBudgetLog.cat].subcats.forEach((subcat: { title: string; }) => { this.subcategoriesList.push(subcat.title) });
    this.subcatForm.enable();
    this.categoriesService.allCategories.forEach(cat => { this.categoriesList.push(cat.title) });
    // this.getRecurrencyFamily();
    this.budgetingService.recordBorderStyle['background-color'] = this.categoriesService.catEnum[this.budgetLog.cat].bgcolor;
  }

  getRecurrencyFamily(): void {
    if (this.budgetLog.recurrencyid === 0) { return }
    const HTTP_PARAMS = new HttpParams().set('tlogID', this.budgetLog.id).set('recurID', this.budgetLog.recurrencyid)
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

  saveBudgetLog(): void {
    const HTTP_PARAMS = new HttpParams().set('tlog', JSON.stringify(this.tempBudgetLog))
    const CALL = this._http.post('http://localhost:16190/updatetreasurylog', HTTP_PARAMS, { responseType: 'text' })

    CALL.subscribe({
      next: codeReceived => {
        this.treasuryService.fetchTreasuryLog('saveTreasuryLog', this.tempBudgetLog.id);
        this.editingMode = false;
        this._categoriesSnackBarService.triggerMHQSnackbar(true, 'save_as', this.tempBudgetLog.title, ['O movimento ', ' foi atualizado com sucesso.']);
      },
      error: err => {
        this._errorHandlingService.handleError(err);
        this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', this.tempBudgetLog.title, ['Ocurreu algo inesperado ao atualizar o movimento ', '.']);
      }
    })
  }


  openMissingCategoriesSnackBar(): void {
    this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', 'categoria/sub-categoria', ['O par ', 'não se encontra definido.'])
  }

  editingBudgetLogRecordActions(action: string): void {
    switch (action) {
      case 'start':
        this.tempBudgetLog = JSON.parse(JSON.stringify(this.budgetLog));
        this.refreshSubcategoryList(this.tempBudgetLog.cat);
        this.catForm = new FormControl(this.categoriesService.catEnum[this.tempBudgetLog.cat].title, [Validators.required]);
        this.subcatForm = new FormControl(this.categoriesService.subcatEnum[this.tempBudgetLog.subcat].title, [Validators.required]);
        this.subcategoriesList.length > 0 ? this.subcatForm.enable() : this.subcatForm.disable();
        this.editingMode = true;
        break;

      case 'save':
        if (this.catForm.errors || this.subcatForm.errors || this.subcatForm.value === '' || this.subcatForm.disabled) { return this.openMissingCategoriesSnackBar(); }
        const CATEGORY = this.categoriesService.catTitleEnum[`${this.catForm.value}`];
        this.tempBudgetLog.date = this.budgetLogDatepickerForm.value.getTime();
        this.tempBudgetLog.cat = CATEGORY.id;
        this.tempBudgetLog.subcat = this.categoriesService.subcatTitleEnum[`${this.subcatForm.value}`].id;
        this.treasuryService.recordBorderStyle['background-color'] = CATEGORY.bgcolor;
        this.tempBudgetLog.value = Number(this.tempBudgetLog.value.toString().replace(',', '.')); // conversão de vírgulas para pontos
        if (!this.tempBudgetLog.value.toString().match(/^[0-9]*\.?[0-9]{0,2}$/g)) {
          return this._categoriesSnackBarService.triggerMHQSnackbar(false, 'report', 'Valor', ['O campo ', ' encontra-se incorretamente definido.']);
        }

        if (this.tempBudgetLog.recurrencyid === 0) {
          this.saveBudgetLog();
        }
        if (this.tempBudgetLog.recurrencyid !== 0) {
          this.treasuryService.recurrenyTempTlog = this.tempBudgetLog;
          // this.openDialog2('300ms', '150ms')
        }
        break;

      case 'end': default:
        this.editingMode = false;
    }
  }

  // openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
  //   this._dialog.open(DeleteTreasuryLogConfirmationModal, {
  //     width: '600px',
  //     height: '300px',
  //     enterAnimationDuration,
  //     exitAnimationDuration,
  //   });
  // }

  // openDialog2(enterAnimationDuration: string, exitAnimationDuration: string): void {
  //   this._dialog.open(UpdateRecurrencyLogConfirmationModal, {
  //     width: '640px',
  //     height: '320px',
  //     enterAnimationDuration,
  //     exitAnimationDuration,
  //   });
  // }

  // openDialog3(enterAnimationDuration: string, exitAnimationDuration: string): void {
  //   this.treasuryService.recurrenyTempTlog = this.tempTreasuryLog;
  //   this._dialog.open(DettachRecurrencyConfirmationModal, {
  //     width: '640px',
  //     height: '320px',
  //     enterAnimationDuration,
  //     exitAnimationDuration,
  //   });
  // }

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
