import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';
import { MHQSnackBarsService } from 'src/assets/services/mhq-snackbar.service';
import { ErrorHandlingService } from 'src/assets/services/misc.service';
import { BudgetingService } from '../../../budgeting/budgeting.service';
import { TreasuryService } from '../../treasury.service';

export type RecurrencyOptions = {
  name: string;
  toChange: boolean;
  color: ThemePalette;
  options?: RecurrencyOptions[];
}


@Component({
  selector: 'mhq-update-recurrency-modal',
  templateUrl: './update-recurrency-modal.component.html',
  styleUrls: ['../../../../../../assets/styles/mhq-modal.scss']
})
export class UpdateRecurrencyModalComponent {

  recurrencyOptions: RecurrencyOptions;
  allRecurrencyOptions: boolean = false;

  constructor(public treasuryService: TreasuryService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService, private _categoriesSnackBarService: MHQSnackBarsService, public router: Router, public bugetsService: BudgetingService) {
    this.allRecurrencyOptions = false;
    this.recurrencyOptions = {
      name: 'Opções a alterar', toChange: false, color: 'primary', options: [
        { name: 'Título', toChange: false, color: 'primary' },
        { name: 'Valor', toChange: false, color: 'primary' }
      ]
    }
  }

  updateRecurrencyStatus() { this.allRecurrencyOptions = this.recurrencyOptions.options != null && this.recurrencyOptions.options.every(option => option.toChange); }

  getRecurrencyOptionsStatus() {
    if (this.recurrencyOptions.options == null) { return false; }
    return this.recurrencyOptions.options.filter(option => option.toChange).length > 0 && !this.allRecurrencyOptions;
  }

  wantAllRecurrencyOptions(toChange: boolean) {
    this.allRecurrencyOptions = toChange;
    if (this.recurrencyOptions.options == null) { return; }
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


