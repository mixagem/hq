
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MHQSnackBarsService } from 'src/assets/services/mhq-snackbar.service';
import { ErrorHandlingService } from 'src/assets/services/misc.service';
import { EfaturaService } from './efatura.service';


@Component({
  selector: 'mhq-efatura',
  templateUrl: './efatura.component.html',
  styleUrls: ['./efatura.component.scss', '../../../../assets/styles/mhq-mainform.scss']
})
export class EfaturaComponent implements OnInit {

  eFaturaSnapshots: number[];
  snapshotsReady: boolean;

  constructor(public eFaturaService:EfaturaService, private _http: HttpClient, private _mhqSnackbarService: MHQSnackBarsService, private _errorHandlingService: ErrorHandlingService) {
    this.eFaturaSnapshots = [];
    this.snapshotsReady = false;
  }
  ngOnInit(): void {
    this.fetchEFaturaSnapshots();
  }

  fetchEFaturaSnapshots(): void {

    const CALL = this._http.get('http://localhost:16190/efaturasnapshots', { responseType: 'json' })

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
}

