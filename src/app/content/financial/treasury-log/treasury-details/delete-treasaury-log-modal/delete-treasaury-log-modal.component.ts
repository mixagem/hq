import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ErrorHandlingService } from 'src/assets/services/misc.service';
import { BudgetingService } from '../../../budgeting/budgeting.service';
import { TreasuryService } from '../../treasury.service';

@Component({
  selector: 'mhq-delete-treasaury-log-modal',
  templateUrl: './delete-treasaury-log-modal.component.html',
  styles: ['.mhq-modal-header{background-color: var(--mhq-waikiki-danger)!important;}'],
  styleUrls: ['../../../../../../assets/styles/mhq-modal.scss']
})
export class DeleteTreasauryLogModalComponent {
  haveRecurrency: boolean;

  constructor(public treasuryService: TreasuryService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService, public router: Router, public budgetingService: BudgetingService) {
    if (this.router.url.startsWith('/fi/tlog')){
      this.haveRecurrency = this.treasuryService.activeTLog.recurrencyid !== 0}
    if (this.router.url.startsWith('/fi/budget')){
      this.haveRecurrency = this.budgetingService.activeBudgetLog.recurrencyid !== 0}
  }

  deleteTreasuryLog(): void {

    let HTTP_PARAMS: HttpParams;
    let CALL: Observable<string>;

    if (this.router.url.startsWith('/fi/tlog')) {
      HTTP_PARAMS = new HttpParams().set('type', 'tlog').set('tlog', this.treasuryService.activeTLog.id)
      CALL = this._http.post('http://localhost:16190/deletetreasurylog', HTTP_PARAMS, { responseType: 'text' })

      CALL.subscribe({
        next: codeReceived => { this.treasuryService.fetchTreasuryLog('deleteTLog'); },
        error: err => this._errorHandlingService.handleError(err)
      })
    }


    if (this.router.url.startsWith('/fi/budget')) {
      HTTP_PARAMS = new HttpParams().set('type', 'budget').set('budget', this.budgetingService.activeBudgetLog.id)
      CALL = this._http.post('http://localhost:16190/deletetreasurylog', HTTP_PARAMS, { responseType: 'text' })

      CALL.subscribe({
        next: codeReceived => { this.budgetingService.fetchBudgetLog('deleteBudgetLog'); },
        error: err => this._errorHandlingService.handleError(err)
      })
    }


  }

  deleteAllRecurrencies(): void {
    let HTTP_PARAMS: HttpParams;
    let CALL: Observable<string>;

    if (this.router.url.startsWith('/fi/tlog')) {
      HTTP_PARAMS = new HttpParams().set('type','tlog').set('recurrencyID', this.treasuryService.activeTLog.recurrencyid)
      CALL = this._http.post('http://localhost:16190/deleteallrecurrencies', HTTP_PARAMS, { responseType: 'text' })

      CALL.subscribe({
        next: codeReceived => { this.treasuryService.fetchTreasuryLog('deleteTLog'); },
        error: err => this._errorHandlingService.handleError(err)
      })
    }

    if (this.router.url.startsWith('/fi/budget')) {
      HTTP_PARAMS = new HttpParams().set('type','budget').set('recurrencyID', this.budgetingService.activeBudgetLog.recurrencyid)
      CALL = this._http.post('http://localhost:16190/deleteallrecurrencies', HTTP_PARAMS, { responseType: 'text' })

      CALL.subscribe({
        next: codeReceived => { this.budgetingService.fetchBudgetLog('deleteBudgetLog'); },
        error: err => this._errorHandlingService.handleError(err)
      })
    }
  }
}
