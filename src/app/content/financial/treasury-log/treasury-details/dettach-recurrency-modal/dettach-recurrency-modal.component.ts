
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { TreasuryService } from '../../treasury.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BudgetingService } from '../../../budgeting/budgeting.service';
import { ErrorHandlingService } from 'src/assets/services/misc.service';
import { MHQSnackBarsService } from 'src/assets/services/mhq-snackbar.service';

@Component({
  selector: 'mhq-dettach-recurrency-modal',
  templateUrl: './dettach-recurrency-modal.component.html',
  styleUrls: ['../../../../../../assets/styles/mhq-modal.scss']
})

export class DettachRecurrencyModalComponent {

  constructor(public treasuryService: TreasuryService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService, private _snackBarService: MHQSnackBarsService, public router: Router, private bugetService: BudgetingService) { }

  dettachFromRecurrency(): void {

    let HTTP_PARAMS: HttpParams;
    let CALL: Observable<string>;

    if (this.router.url.startsWith('/fi/tlog')) {
      HTTP_PARAMS = new HttpParams().set('type', 'tlog').set('tlog', JSON.stringify(this.treasuryService.activeTLog));
      CALL = this._http.post('http://localhost:16190/dettachrecurrency', HTTP_PARAMS, { responseType: 'text' });

      CALL.subscribe({
        next: codeReceived => {
          this.treasuryService.fetchTreasuryLog('saveTLog', this.treasuryService.activeTLog.id);
          const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
          this._snackBarService.triggerMHQSnackbar(true, 'save_as', this.treasuryService.activeTLog.title, ['O movimento ', ' foi removido da recorrência com sucesso.']);
        },
        error: err => {
          this._errorHandlingService.handleError(err);
          const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
          this._snackBarService.triggerMHQSnackbar(false, 'report', this.treasuryService.activeTLog.title, ['Ocorreu algo inesperado ao atualizar o movimento ', '.']);
        }
      })
    }

    if (this.router.url.startsWith('/fi/budget')) {
      HTTP_PARAMS = new HttpParams().set('type', 'budget').set('budget', JSON.stringify(this.bugetService.recurrenyTempBudgetlog));
      CALL = this._http.post('http://localhost:16190/dettachrecurrency', HTTP_PARAMS, { responseType: 'text' });

      CALL.subscribe({
        next: codeReceived => {
          this.bugetService.fetchBudgetLog('saveBudgetLog', this.bugetService.recurrenyTempBudgetlog.id);
          const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
          this._snackBarService.triggerMHQSnackbar(true, 'save_as', this.bugetService.recurrenyTempBudgetlog.title, ['O orçamento ', ' foi removido da recorrência com sucesso.']);
        },
        error: err => {
          this._errorHandlingService.handleError(err);
          const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
          this._snackBarService.triggerMHQSnackbar(false, 'report', this.bugetService.recurrenyTempBudgetlog.title, ['Ocorreu algo inesperado ao atualizar o orçamento ', '.']);
        }
      })
    }
  }
}
