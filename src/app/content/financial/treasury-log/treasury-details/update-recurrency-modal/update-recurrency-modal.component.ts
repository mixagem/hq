import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { TreasuryService } from '../../treasury.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BudgetingService } from '../../../budgeting/budgeting.service';
import { ErrorHandlingService } from 'src/assets/services/misc.service';
import { MHQSnackBarsService } from 'src/assets/services/mhq-snackbar.service';

type RecurrencyOptions = { name: string; toChange: boolean; color: ThemePalette; value?: string, options?: RecurrencyOptions[]; }

const RECURRENCY_OPTIONS: RecurrencyOptions = {
  name: 'Campos a alterar', toChange: false, color: 'warn', options: [
    { name: 'Título', toChange: false, color: 'primary', value: 'title' },
    { name: 'Valor', toChange: false, color: 'primary', value: 'value' },
    { name: 'Tipo', toChange: false, color: 'primary', value: 'type' },
    { name: 'Categoria + Subcategoria', toChange: false, color: 'primary', value: 'cat' },
    { name: 'Observações', toChange: false, color: 'primary', value: 'obs' },
    { name: 'Tem contribuinte', toChange: false, color: 'primary', value: 'nif' },
    { name: 'Categoria E-Fatura', toChange: false, color: 'primary', value: 'efat' }
  ]
}

@Component({
  selector: 'mhq-update-recurrency-modal',
  templateUrl: './update-recurrency-modal.component.html',
  styleUrls: ['../../../../../../assets/styles/mhq-modal.scss']
})

export class UpdateRecurrencyModalComponent {

  recurrencyOptions: RecurrencyOptions;
  allRecurrencyOptions: boolean = false;

  constructor(private _treasuryService: TreasuryService, private _budgetService: BudgetingService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService, private _categoriesSnackBarService: MHQSnackBarsService, private _router: Router) {
    this.allRecurrencyOptions = false;
    this.recurrencyOptions = JSON.parse(JSON.stringify(RECURRENCY_OPTIONS))
  }


  // atualiza a seta caso estaam todos selecionados
  updateRecurrencyStatus(): void { this.allRecurrencyOptions = this.recurrencyOptions.options != null && this.recurrencyOptions.options.every(option => option.toChange); }

  //atualiza estado da setinha intermitente da checklist
  getRecurrencyOptionsStatus(): boolean {
    if (this.recurrencyOptions.options == null) { return false; }
    return this.recurrencyOptions.options.filter(option => option.toChange).length > 0 && !this.allRecurrencyOptions;
  }

  // alterar todas as opções
  wantAllRecurrencyOptions(toChange: boolean): void {
    if (this.recurrencyOptions.options == null) { return; }
    this.allRecurrencyOptions = toChange;
    this.recurrencyOptions.options.forEach(option => (option.toChange = toChange));
  }

  // envio para bd
  recurrencyUpdate(update: boolean): void {

    // v- granda estalo de nome maré
    let selectedFieldsToMassUpdate: string[] = [];
    this.recurrencyOptions.options!.forEach(options => { if (options.toChange) { selectedFieldsToMassUpdate.push(options.value!) } });

    if (this._router.url.startsWith('/fi/tlog')) {
      const HTTP_PARAMS = new HttpParams().set('type', 'tlog').set('tlog', JSON.stringify(this._treasuryService.activeTLog)).set('fields', JSON.stringify(selectedFieldsToMassUpdate))

      let call;
      if (update) { call = this._http.post('http://localhost:16190/updaterecurrency', HTTP_PARAMS, { responseType: 'json' }) }
      else { call = this._http.post('http://localhost:16190/updatetreasurylog', HTTP_PARAMS, { responseType: 'json' }) }

      call.subscribe({
        next: codeReceived => {
          const RESP = codeReceived as string[];
          if (RESP[0] !== 'MHQERROR') {
            this._treasuryService.fetchTreasuryLog('saveTLog', this._treasuryService.activeTLog.id);
            const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
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

    if (this._router.url.startsWith('/fi/budget')) {
      const HTTP_PARAMS = new HttpParams().set('type', 'budget').set('budget', JSON.stringify(this._budgetService.recurrenyTempBudgetlog)).set('fields', JSON.stringify(selectedFieldsToMassUpdate))

      let call;
      if (update) { call = this._http.post('http://localhost:16190/updaterecurrency', HTTP_PARAMS, { responseType: 'json' }) }
      else { call = this._http.post('http://localhost:16190/updatetreasurylog', HTTP_PARAMS, { responseType: 'json' }) }

      call.subscribe({
        next: codeReceived => {
          const RESP = codeReceived as string[];
          if (RESP[0] !== 'MHQERROR') {
            this._budgetService.fetchBudgetLog('saveBudgetLog', this._budgetService.recurrenyTempBudgetlog.id);
            const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
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

  }
}


