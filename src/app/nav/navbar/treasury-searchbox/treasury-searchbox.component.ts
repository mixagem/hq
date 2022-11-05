import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TreasuryService } from 'src/app/content/financial/treasury-log/treasury.service';
import { ITreasuryLog } from 'src/shared/interfaces/itreasury-log';
import { MHQSnackBarsService } from 'src/shared/services/mhq-snackbar.service';
import { ErrorHandlingService } from 'src/shared/services/misc.service';
import { NavbarService } from '../navbar.service';

@Component({
  selector: 'mhq-treasury-searchbox',
  templateUrl: './treasury-searchbox.component.html',
  styleUrls: ['./treasury-searchbox.component.scss']
})
export class TreasurySearchboxComponent implements OnInit {


  constructor(public router: Router, public treasuryService: TreasuryService, private _errorHandlingService: ErrorHandlingService, private _http: HttpClient, private _mhqSnackbarService: MHQSnackBarsService, public navbarService: NavbarService) {

  }

  ngOnInit(): void {
  }

  logy(reset: boolean, event?: EventTarget): void {

    let HTTP_PARAMS: HttpParams;
    if (reset) {
      HTTP_PARAMS = new HttpParams().set('type', 'tlog').set('search', '')
      this.navbarService.treasuryNavbarInput = ''
    } else {
      const INPUT_ELE = event as HTMLInputElement;
      HTTP_PARAMS = new HttpParams().set('type', 'tlog').set('search', INPUT_ELE.value)
    }
    const CALL = this._http.post('http://localhost:16190/tlogserach', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const ERROR_CODE = codeReceived as string[];
        if (ERROR_CODE[0] === 'MHQERROR') { return this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', ERROR_CODE[1], ['', '']); }
        const RESP = codeReceived as ITreasuryLog[];

        this.treasuryService.tLogTable = {}; RESP.forEach(tlog => { this.treasuryService.tLogTable[`'${tlog.id}'`] = tlog; });
        this.treasuryService.textSearchRefresh = true;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this.router.navigate(['/fi/tlogs']); });
      },
      error: err => this._errorHandlingService.handleError(err)
    });
  }

}
