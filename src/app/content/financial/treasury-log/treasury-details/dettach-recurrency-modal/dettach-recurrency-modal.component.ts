
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { TreasuryService } from '../../treasury.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BudgetingService } from '../../../budgeting/budgeting.service';
import { ErrorHandlingService } from 'src/shared/services/misc.service';
import { MHQSnackBarsService } from 'src/shared/services/mhq-snackbar.service';

@Component({
  selector: 'mhq-dettach-recurrency-modal',
  templateUrl: './dettach-recurrency-modal.component.html',
  styleUrls: ['../../../../../../shared/styles/mhq-modal.scss']
})

export class DettachRecurrencyModalComponent {

  constructor(public treasuryService: TreasuryService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService, private _snackBarService: MHQSnackBarsService, public router: Router, private bugetService: BudgetingService) { }

  dettachFromRecurrency(): void {

    let HTTP_PARAMS: HttpParams;
    let CALL: Observable<Object>;

    if (this.router.url.startsWith('/fi/tlog')) {
      HTTP_PARAMS = new HttpParams().set('type', 'tlog').set('tlog', JSON.stringify(this.treasuryService.activeTLog));
      CALL = this._http.post('http://localhost:16190/dettachrecurrency', HTTP_PARAMS, { responseType: 'json' });

      CALL.subscribe({
        next: codeReceived => {
          const RESP = codeReceived as string[];
          if (RESP[0] !== 'MHQERROR') {
            this.treasuryService.fetchTreasuryLog('saveTLog', this.treasuryService.activeTLog.id);
            const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
            this._snackBarService.triggerMHQSnackbar(true, 'save_as', '', [RESP[0], '']);
          } else {
            this._snackBarService.triggerMHQSnackbar(false, 'warning_amber', '', [RESP[1], '']);
          }
        },
        error: err => {
          this._errorHandlingService.handleError(err);
        }
      })
    }

    if (this.router.url.startsWith('/fi/budget')) {
      HTTP_PARAMS = new HttpParams().set('type', 'budget').set('budget', JSON.stringify(this.bugetService.recurrenyTempBudgetlog));
      CALL = this._http.post('http://localhost:16190/dettachrecurrency', HTTP_PARAMS, { responseType: 'json' });

      CALL.subscribe({
        next: codeReceived => {
          const RESP = codeReceived as string[];
          if (RESP[0] !== 'MHQERROR') {
            this.bugetService.fetchBudgetLog('saveBudgetLog', this.bugetService.recurrenyTempBudgetlog.id);
            const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
            this._snackBarService.triggerMHQSnackbar(true, 'save_as', '', [RESP[0], '']);
          } else {
            this._snackBarService.triggerMHQSnackbar(false, 'warning_amber', '', [RESP[1], '']);
          }
        },
        error: err => {
          this._errorHandlingService.handleError(err);
        }
      });

    }
  }
}
