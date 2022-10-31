import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { TreasuryService } from '../../treasury.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BudgetingService } from '../../../budgeting/budgeting.service';
import { ErrorHandlingService } from 'src/assets/services/misc.service';
import { MHQSnackBarsService } from 'src/assets/services/mhq-snackbar.service';

@Component({
  selector: 'mhq-delete-treasaury-log-modal',
  templateUrl: './delete-treasaury-log-modal.component.html',
  styles: ['.mhq-modal-header{background-color: var(--mhq-waikiki-danger)!important;}'],
  styleUrls: ['../../../../../../assets/styles/mhq-modal.scss']
})

export class DeleteTreasauryLogModalComponent {

  haveRecurrency: boolean;

  constructor(private _mhqSnackbarService: MHQSnackBarsService, public treasuryService: TreasuryService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService, public router: Router, public budgetService: BudgetingService) {
    if (this.router.url.startsWith('/fi/tlog')) { this.haveRecurrency = this.treasuryService.activeTLog.recurrencyid !== 0 }
    if (this.router.url.startsWith('/fi/budget')) { this.haveRecurrency = this.budgetService.activeBudgetLog.recurrencyid !== 0 }
  }

  deleteTreasuryLog(): void {
    let HTTP_PARAMS: HttpParams;
    let CALL: Observable<Object>;
    if (this.router.url.startsWith('/fi/tlog')) {
      HTTP_PARAMS = new HttpParams().set('type', 'tlog').set('tlogID', this.treasuryService.activeTLog.id)
      CALL = this._http.post('http://localhost:16190/deletetreasurylog', HTTP_PARAMS, { responseType: 'json' })

      CALL.subscribe({
        next: codeReceived => {
          const ERROR_CODE = codeReceived as string[];
          if (ERROR_CODE[0] === 'MHQERROR') { return this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', ERROR_CODE[1], ['', '']); }

          this._mhqSnackbarService.triggerMHQSnackbar(true, 'recycling', '', [ERROR_CODE[0], ''])
          this.treasuryService.fetchTreasuryLog('deleteTLog');
        },
        error: err => this._errorHandlingService.handleError(err)
      })
    }

    if (this.router.url.startsWith('/fi/budget')) {
      HTTP_PARAMS = new HttpParams().set('type', 'budget').set('budgetID', this.budgetService.activeBudgetLog.id)
      CALL = this._http.post('http://localhost:16190/deletetreasurylog', HTTP_PARAMS, { responseType: 'text' })

      CALL.subscribe({
        next: codeReceived => {
          const ERROR_CODE = codeReceived as string[];
          if (ERROR_CODE[0] === 'MHQERROR') { return this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', ERROR_CODE[1], ['', '']); }
          else {
            this.budgetService.fetchBudgetLog('deleteBudgetLog');
            this._mhqSnackbarService.triggerMHQSnackbar(true, 'recycling', '', [ERROR_CODE[0], ''])
          }
        },
        error: err => this._errorHandlingService.handleError(err)
      })
    }
  }

  deleteAllRecurrencies(): void {
    let HTTP_PARAMS: HttpParams;
    let CALL: Observable<Object>;

    if (this.router.url.startsWith('/fi/tlog')) {
      HTTP_PARAMS = new HttpParams().set('type', 'tlog').set('recurrencyID', this.treasuryService.activeTLog.recurrencyid)
      CALL = this._http.post('http://localhost:16190/deleteallrecurrencies', HTTP_PARAMS, { responseType: 'json' })

      CALL.subscribe({
        next: codeReceived => {

          const RESP = codeReceived as string[];
          if (RESP[0] !== 'MHQERROR') {

            this.treasuryService.fetchTreasuryLog('deleteTLog');
            this._mhqSnackbarService.triggerMHQSnackbar(true, 'recycling', '', [RESP[0], '']);
          }
          else { return this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', RESP[1], ['', '']); }
        },
        error: err => this._errorHandlingService.handleError(err)
      })
    }

    if (this.router.url.startsWith('/fi/budget')) {
      HTTP_PARAMS = new HttpParams().set('type', 'budget').set('recurrencyID', this.budgetService.activeBudgetLog.recurrencyid)
      CALL = this._http.post('http://localhost:16190/deleteallrecurrencies', HTTP_PARAMS, { responseType: 'json' })

      CALL.subscribe({
        next: codeReceived => {
          const RESP = codeReceived as string[];
          if (RESP[0] !== 'MHQERROR') {

            this.budgetService.fetchBudgetLog('deleteBudgetLog');
            this._mhqSnackbarService.triggerMHQSnackbar(true, 'recycling', '', [RESP[0], '']);
          }
          else { return this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', RESP[1], ['', '']); }
        },
        error: err => this._errorHandlingService.handleError(err)
      })
    }
  }
}