import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CategoriesService } from 'src/app/content/financial/categories/categories.service';
import { TreasuryService } from 'src/app/content/financial/treasury-log/treasury.service';
import { MHQSnackBarsService } from 'src/shared/services/mhq-snackbar.service';
import { ErrorHandlingService } from 'src/shared/services/misc.service';
import { AdvancedTreasurySearchService } from '../advanced-treasury-search.service';

@Component({
  selector: 'mhq-delete-search-modal',
  templateUrl: './delete-search-modal.component.html',
  styles: ['.mhq-modal-header{background-color: var(--mhq-waikiki-danger)!important;}', '.mhq-category-modal-label{padding: 5px 10px;border-radius: 5px;}'],
  styleUrls: ['../../../../../../shared/styles/mhq-modal.scss']
})
export class DeleteSearchModalComponent implements OnInit {

  constructor(private _mhqSnackbarService: MHQSnackBarsService, public categoriesService: CategoriesService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService, private _treasurySearchService: AdvancedTreasurySearchService, public dialogRef: MatDialogRef<DeleteSearchModalComponent>) { }

  ngOnInit(): void {
  }

  deleteSearch(): void {


    const HTTP_PARAMS = new HttpParams().set('search', JSON.stringify(this._treasurySearchService.activeSearch))
    const CALL = this._http.post('http://localhost:16190/deletesearch', HTTP_PARAMS, { responseType: 'json' })
    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as string[];
        if (RESP[0] === 'MHQERROR') { this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', '', [RESP[1], '']) }
        else {
          this.dialogRef.close();
          this._mhqSnackbarService.triggerMHQSnackbar(true, 'recycling', '', [RESP[0], '']);

          if (RESP[1] !== 'none') {
            this._treasurySearchService.selectedSearchIndex = Number(RESP[1]);
            this._treasurySearchService.selectedSearchForm = new FormControl(this._treasurySearchService.selectedSearchIndex);
            this._treasurySearchService.activeSearch = this._treasurySearchService.advancedSearchTable[this._treasurySearchService.selectedSearchIndex]

          } else {

            this._treasurySearchService.selectedSearchForm = new FormControl();
            this._treasurySearchService.tlogSearch(false)
          }
          this._treasurySearchService.fetchAdavancedSearches(true)
        }


      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }

}
