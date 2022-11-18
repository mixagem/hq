import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TreasuryService } from 'src/app/content/financial/treasury-log/treasury.service';
import { ITreasuryLog } from 'src/shared/interfaces/itreasury-log';
import { MHQSnackBarsService } from 'src/shared/services/mhq-snackbar.service';
import { ErrorHandlingService } from 'src/shared/services/misc.service';
import { AdvancedTreasurySearchComponent } from './advanced-treasury-search/advanced-treasury-search.component';
import { AdvancedTreasurySearchService } from './advanced-treasury-search/advanced-treasury-search.service';




@Component({
  selector: 'mhq-treasury-searchbox',
  templateUrl: './treasury-searchbox.component.html',
  styleUrls: ['./treasury-searchbox.component.scss']
})
export class TreasurySearchboxComponent implements OnInit {



  constructor(private _dialog: MatDialog, public router: Router, public treasuryService: TreasuryService, private _errorHandlingService: ErrorHandlingService, private _http: HttpClient, private _mhqSnackbarService: MHQSnackBarsService, public advancedTlogSearchService: AdvancedTreasurySearchService) {
  }

  ngOnInit(): void {
  }


  swapSearchMode(): void {
    if (this.advancedTlogSearchService.searchMode === 'advanced') {
      this.advancedTlogSearchService.searchMode = 'simple'
      this.tlogSearch(false);
    } else {
      this.advancedTlogSearchService.searchMode = 'advanced'

      this.advancedTlogSearchService.activeSearch = this.advancedTlogSearchService.advancedSearchTable[this.advancedTlogSearchService.selectedSearchIndex];
      this.advancedTlogSearchService.triggerAdavancedSearch()

    }
  }


  tlogSearch(reset: boolean = false): void {

    if (reset) { this.advancedTlogSearchService.treasuryNavbarInput = '' }

    let HTTP_PARAMS: HttpParams;

    HTTP_PARAMS = new HttpParams().set('type', 'tlog').set('search', this.advancedTlogSearchService.treasuryNavbarInput)

    const CALL = this._http.post('http://localhost:16190/tlogsearch', HTTP_PARAMS, { responseType: 'json' });
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

  openAdvancedTreasurySearchModal(enterAnimationDuration: string, exitAnimationDuration: string) {
    this._dialog.open(AdvancedTreasurySearchComponent, {
      width: '800px',
      height: '500px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }





}
