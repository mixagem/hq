import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MHQSnackBarsService } from 'src/shared/services/mhq-snackbar.service';
import { ErrorHandlingService } from 'src/shared/services/misc.service';
import { EfaturaService } from '../../../efatura/efatura.service';
import { TreasuryService } from '../../treasury.service';

@Component({
  selector: 'mhq-check-treasury-efat',
  templateUrl: './check-treasury-efat.component.html',
  styleUrls: ['./check-treasury-efat.component.scss', '../../../../../../shared/styles/mhq-modal.scss']
})
export class CheckTreasuryEfatComponent implements OnInit {

  ivaValue: number;

  constructor(public _router: Router, public efaturaService: EfaturaService, public treasuryService: TreasuryService, private _http: HttpClient, private _mhqSnackbarService: MHQSnackBarsService, private _errorHandlingService: ErrorHandlingService) {
    this.ivaValue = 0;
  }

  ngOnInit(): void { }

  insertEFatura(): void {

    const DEDUCTION_VALUE = this.efaturaService.efaturaTable[this.treasuryService.activeTLog.efat].usesIVAToCalc ?
      this.ivaValue * this.efaturaService.efaturaTable[this.treasuryService.activeTLog.efat].calcPercentage :
      this.treasuryService.activeTLog.value * this.efaturaService.efaturaTable[this.treasuryService.activeTLog.efat].calcPercentage

    const EFATURA = {
      tlogid: this.treasuryService.activeTLog.id,
      tlogtitle: this.treasuryService.activeTLog.title,
      efat: this.treasuryService.activeTLog.efat,
      value: this.treasuryService.activeTLog.type === 'income' ? -Number(DEDUCTION_VALUE.toFixed(2)) : Number(DEDUCTION_VALUE.toFixed(2)),
      year: new Date(this.treasuryService.activeTLog.date).getFullYear()
    }

    const HTTP_PARAMS = new HttpParams().set('efatura', JSON.stringify(EFATURA))
    const CALL = this._http.post('http://localhost:16190/insertefatura', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as string[];
        if (RESP[0] !== 'MHQERROR') {
          const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
          this.treasuryService.fetchTreasuryLog('saveTLog', this.treasuryService.activeTLog.id)
          this._mhqSnackbarService.triggerMHQSnackbar(true, 'save_as', '', [RESP[0], '']); // dispara a snackbar
        }
        else {
          this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', '', [RESP[1], '']);
        }
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }

}
