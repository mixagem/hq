
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ITreasuryLog } from 'src/shared/interfaces/itreasury-log';
import { MHQSnackBarsService } from 'src/shared/services/mhq-snackbar.service';
import { ErrorHandlingService } from 'src/shared/services/misc.service';
import { CheckTreasuryEfatComponent } from '../treasury-log/treasury-details/check-treasury-efat/check-treasury-efat.component';
import { TreasuryService } from '../treasury-log/treasury.service';
import { EfaturaService } from './efatura.service';


@Component({
  selector: 'mhq-efatura',
  templateUrl: './efatura.component.html',
  styleUrls: ['./efatura.component.scss', '../../../../shared/styles/mhq-mainform.scss']
})
export class EfaturaComponent implements OnInit {

  eFaturaSnapshots: number[];
  movimentsToValidate: ITreasuryLog[];
  snapshotsReady: boolean;
  movementsReady: boolean;

  constructor(private _treasuryService:TreasuryService, private _dialog:MatDialog, public eFaturaService:EfaturaService, private _http: HttpClient, private _mhqSnackbarService: MHQSnackBarsService, private _errorHandlingService: ErrorHandlingService) {
    this.eFaturaSnapshots = [];
    this.snapshotsReady = false;
    this.movementsReady = false;
  }
  ngOnInit(): void {
    this.fetchEFaturaSnapshots();
    this.fetchMovemntsToValidate();
  }

  

  fetchEFaturaSnapshots(): void {

    const CALL = this._http.get('http://localhost:16190/efaturasnapshots', { responseType: 'json' })
    // const CALL = this._http.get('http://localhost/hq/php/efat/efatsnaps.php', { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const ERROR_CODE = codeReceived as string[];
        if (ERROR_CODE[0] === 'MHQERROR') {
          return this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', '', [ERROR_CODE[1], '']);
        }
        const RESP = codeReceived as number[];
        this.eFaturaSnapshots = RESP;
        this.snapshotsReady = true;
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }


  fetchMovemntsToValidate(): void {

    const CALL = this._http.get('http://localhost:16190/tlogstovalidate', { responseType: 'json' })
    // const CALL = this._http.get('http://localhost/hq/php/efat/movstovalidate.php', { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const ERROR_CODE = codeReceived as string[];
        if (ERROR_CODE[0] === 'MHQERROR') {
          return this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', '', [ERROR_CODE[1], '']);
        }
        const RESP = codeReceived as ITreasuryLog[];
        this.movimentsToValidate = RESP;
        this.movementsReady = true;
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }


  efatCheckModal(enterAnimationDuration: string, exitAnimationDuration: string, i:number): void {
    this._treasuryService.activeTLog = this.movimentsToValidate[i]
    console.log(this._treasuryService.activeTLog )
    this._dialog.open(CheckTreasuryEfatComponent, { width: '600px', height: '300px', enterAnimationDuration, exitAnimationDuration, });
  }
}

