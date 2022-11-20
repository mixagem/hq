import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ITreasuryLog } from 'src/shared/interfaces/itreasury-log';
import { CategoriesService } from '../../categories/categories.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { ErrorHandlingService, LoadingService } from 'src/shared/services/misc.service';
import { MatSelectChange } from '@angular/material/select';
import { MHQSnackBarsService } from 'src/shared/services/mhq-snackbar.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { IFinancialCategory } from 'src/shared/interfaces/ifinancial-category';
import { BudgetingService } from '../budgeting.service';
import { DeleteTreasauryLogModalComponent } from '../../treasury-log/treasury-details/delete-treasaury-log-modal/delete-treasaury-log-modal.component';
import { DettachRecurrencyModalComponent } from '../../treasury-log/treasury-details/dettach-recurrency-modal/dettach-recurrency-modal.component';
import { UpdateRecurrencyModalComponent } from '../../treasury-log/treasury-details/update-recurrency-modal/update-recurrency-modal.component';

@Component({
  selector: 'mhq-budget-details',
  templateUrl: './budget-details.component.html',
  styleUrls: ['./budget-details.component.scss', '../../../../../shared/styles/mhq-mainform-details.scss']
})

export class BudgetDetailsComponent implements OnInit {
  firstLoadingComplete: boolean;

  budgetLogDatepicker: MatDatepicker<any>;   // datepickers
  budgetLogDatepickerForm: FormControl<any>;
  catForm: FormControl   // autocomplete categoria
  catList: string[] = [];
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

  constructor(public loadingService: LoadingService, private _errorHandlingService: ErrorHandlingService, private _route: ActivatedRoute, private _dialog: MatDialog, private _http: HttpClient, public categoriesService: CategoriesService, private _categoriesSnackBarService: MHQSnackBarsService, private _router: Router, public budgetService: BudgetingService) {
    this.editingMode = false;
    this.firstLoadingComplete = false;
    this.recurrencyFamily = [];
  }

  ngOnInit(): void {
    // loading check
    this.budgetService.onInitTrigger.subscribe(x => { this.ngOnInit(); }); this.categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this.loadingService.categoriesLoadingComplete || !this.loadingService.budgetingLoadingComplete || this.firstLoadingComplete) { return }
    this.firstLoadingComplete = true;
    this.id = Number(this._route.snapshot.paramMap.get('id')!);
    this.budgetLog = this.budgetService.budgetEnum[this.id]
    this.tempBudgetLog = JSON.parse(JSON.stringify(this.budgetLog));
    this.budgetService.activeBudgetLog = JSON.parse(JSON.stringify(this.budgetLog));
    this.budgetLogDatepickerForm = new FormControl(new Date(this.budgetLog.date), [Validators.required]);
    this.catForm = new FormControl(this.categoriesService.catTable[`'${this.tempBudgetLog.cat}'`].title, [Validators.required]);
    this.subcatForm = new FormControl({ value: this.categoriesService.subcatTable[`'${this.tempBudgetLog.subcat}'`].title, disabled: true }, [Validators.required]);
    this.categoriesService.catTable[`'${this.tempBudgetLog.cat}'`].subcats.forEach((subcat: { title: string; }) => { this.subcategoriesList.push(subcat.title) });
    this.subcatForm.enable();
    for (let i = 0; i < Object.keys(this.categoriesService.catTable).length; i++) {
      this.catList.push(this.categoriesService.catTable[Object.keys(this.categoriesService.catTable)[i]].title)
    }
    // this.categoriesService.allCategories.forEach(cat => { this.catList.push(cat.title) });
    this.getRecurrencyFamily();
    this.budgetService.recordBorderStyle['background-color'] = this.categoriesService.catTable[`'${this.tempBudgetLog.cat}'`].bgcolor;
  }

  getRecurrencyFamily(): void {
    if (this.budgetLog.recurrencyid === 0) { return }
    const HTTP_PARAMS = new HttpParams().set('type', 'budget').set('budgetID', this.budgetLog.id).set('recurID', this.budgetLog.recurrencyid)
    const CALL = this._http.post('http://localhost:16190/getrecurencylogs', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const ERROR_CODE = codeReceived as string[];
        if (ERROR_CODE[0] === 'MHQERROR') {
          return this._categoriesSnackBarService.triggerMHQSnackbar(false, 'warning_amber', '', [ERROR_CODE[1], '']);
        }
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
    const HTTP_PARAMS = new HttpParams().set('type', 'budget').set('budget', JSON.stringify(this.tempBudgetLog))
    const CALL = this._http.post('http://localhost:16190/updatetreasurylog', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as string[];
        if (RESP[0] !== 'MHQERROR') {
          this.budgetService.fetchBudgetLog('saveBudgetLog', this.tempBudgetLog.id);
          this.editingMode = false;
          this._categoriesSnackBarService.triggerMHQSnackbar(true, 'save_as', '', [RESP[0], '']);
        }
        else { this._categoriesSnackBarService.triggerMHQSnackbar(false, 'warning_amber', '', [RESP[1], '']); }

      },
      error: err => {
        this._errorHandlingService.handleError(err);
      }
    })
  }


  editingBudgetLogRecordActions(action: string): void {
    switch (action) {
      case 'start':
        this.tempBudgetLog = JSON.parse(JSON.stringify(this.budgetLog));
        this.refreshSubcategoryList(this.tempBudgetLog.cat);
        this.catForm = new FormControl(this.categoriesService.catTable[`'${this.tempBudgetLog.cat}'`].title, [Validators.required]);
        this.subcatForm = new FormControl(this.categoriesService.subcatTable[`'${this.tempBudgetLog.subcat}'`].title, [Validators.required]);
        this.subcategoriesList.length > 0 ? this.subcatForm.enable() : this.subcatForm.disable();
        this.editingMode = true;
        break;

      case 'save':
        if (this.catForm.errors || this.subcatForm.errors || this.subcatForm.value === '' || this.subcatForm.disabled) { return this._categoriesSnackBarService.triggerMHQSnackbar(false, 'warning_amber', 'categoria/sub-categoria', ['O par ', ' não se encontra definido.']); }
        // const CATEGORY = this.categoriesService.catTitleEnum[`${this.catForm.value}`];
        this.tempBudgetLog.date = this.budgetLogDatepickerForm.value.getTime();
        // this.tempBudgetLog.cat = CATEGORY.id;
        // this.tempBudgetLog.subcat = this.categoriesService.subcatTitleEnum[`${this.subcatForm.value}`].id;
        // this.budgetService.recordBorderStyle['background-color'] = CATEGORY.bgcolor;
        this.tempBudgetLog.value = Number(this.tempBudgetLog.value.toString().replace(',', '.')); // conversão de vírgulas para pontos
        if (!this.tempBudgetLog.value.toString().match(/^[0-9]*\.?[0-9]{0,2}$/g)) {
          return this._categoriesSnackBarService.triggerMHQSnackbar(false, 'warning_amber', 'Valor', ['O campo ', ' encontra-se incorretamente definido.']);
        }

        if (this.tempBudgetLog.recurrencyid === 0) { this.saveBudgetLog(); }

        if (this.tempBudgetLog.recurrencyid !== 0) {
          this.budgetService.recurrenyTempBudgetlog = this.tempBudgetLog;
          this.updateBudgetRecurrencyLogModal('300ms', '150ms')
        }
        break;

      case 'end': default:
        this.editingMode = false;
    }
  }

  deleteBudgetLogModal(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this._dialog.open(DeleteTreasauryLogModalComponent, {
      width: '600px',
      height: '300px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  updateBudgetRecurrencyLogModal(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this._dialog.open(UpdateRecurrencyModalComponent, {
      width: '640px',
      height: '320px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  dettachBudgetRecurrencyModal(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.budgetService.recurrenyTempBudgetlog = this.tempBudgetLog;
    this._dialog.open(DettachRecurrencyModalComponent, {
      width: '640px',
      height: '320px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  refreshSubcategoryList(catID: number = 0, catTitle: string = ''): void {
    let category: IFinancialCategory;
    if (catID !== 0) { category = this.categoriesService.catTable[`'${catID}'`]; }
    // if (catTitle !== '') { category = this.categoriesService.catTitleEnum[`${catTitle}`] }
    this.subcategoriesList = [];
    category!.subcats.forEach(subcat => { this.subcategoriesList.push(subcat.title) });
  }

  catChanged(event: MatSelectChange): void {
    this.refreshSubcategoryList(0, event.value);
    this.subcatForm.setValue('');
    this.subcategoriesList.length > 0 ? this.subcatForm.enable() : this.subcatForm.disable();
  }

  recurrencyToggle(event: MatSlideToggleChange): void {
    event.checked ? this.recurrencyFrequency.enable() : this.recurrencyFrequency.disable();
  }

  viewMode(logID: number): void {
    this._router.navigateByUrl('/fi/budget', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/budget', logID]); });
  }





}
