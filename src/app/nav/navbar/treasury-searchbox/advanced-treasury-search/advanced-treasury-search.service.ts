import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { CategoriesService } from 'src/app/content/financial/categories/categories.service';
import { TreasuryService } from 'src/app/content/financial/treasury-log/treasury.service';
import { IAdvancedSearch } from 'src/shared/interfaces/iadanved-search';
import { ITreasuryLog } from 'src/shared/interfaces/itreasury-log';
import { MHQSnackBarsService } from 'src/shared/services/mhq-snackbar.service';
import { ErrorHandlingService } from 'src/shared/services/misc.service';

type SearchMode = 'simple' | 'advanced'
type AdvancedSearchTable = { [key: number]: IAdvancedSearch }

@Injectable({
  providedIn: 'root'
})
export class AdvancedTreasurySearchService {
  activeSearch: IAdvancedSearch;
  advancedSearchArray: IAdvancedSearch[];
  advancedSearchTable: AdvancedSearchTable;
  selectedSearchIndex: number;
  isTableReady: boolean;
  waitingForSQL: boolean;
  selectedSearchForm: FormControl;
  firstLoop: boolean;
  treasuryNavbarInput: string;
  searchMode: SearchMode;

  constructor(private _http: HttpClient, private _mhqSnackbarService: MHQSnackBarsService, private _errorHandlingService: ErrorHandlingService, private treasuryService: TreasuryService, private _router: Router) {
    this.selectedSearchIndex = 0;
    this.advancedSearchArray = [];
    this.advancedSearchTable = {};
    this.isTableReady = false;
    this.selectedSearchForm = new FormControl();
    this.firstLoop = true;
    this.fetchAdavancedSearches()
    this.treasuryNavbarInput = '';
    this.searchMode = 'simple'
  }

  fetchAdavancedSearches(trigger: boolean = false): void {

    const CALL = this._http.get('http://localhost:16190/fetchsearches', { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {

        const ERROR_CODE = codeReceived as string[];
        if (ERROR_CODE[0] === 'MHQERROR') { return this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', ERROR_CODE[1], ['', '']); }
        const RESP = codeReceived as IAdvancedSearch[];
        this.advancedSearchTable = RESP;
        this.advancedSearchArray = [];

        for (let i = 0; i < Object.keys(this.advancedSearchTable).length; i++) {
          const I = Number(Object.keys(this.advancedSearchTable)[i])
          this.advancedSearchArray.push(this.advancedSearchTable[I])
          this.advancedSearchArray[i].parameters.forEach(parameter => {
            if (['nif', 'efatcheck', 'recurrencyid'].includes(parameter.field)) {
              parameter.value === 'true' ? parameter.value = true : parameter.value = false
            }
          });
        }
        if (this.firstLoop && this.advancedSearchArray.length > 0) {
          this.selectedSearchIndex = this.advancedSearchArray[0].id
          this.selectedSearchForm = new FormControl(this.selectedSearchIndex);
          this.activeSearch = this.advancedSearchTable[this.selectedSearchIndex];
          this.firstLoop = false;
        }
        if (trigger) { this.triggerAdavancedSearch() }
        this.isTableReady = true;
      },
      error: err => this._errorHandlingService.handleError(err)
    });
  }

  changedSearch(event: MatSelectChange, trigger: boolean = false): void {
    this.selectedSearchIndex = event.value;
    this.activeSearch = this.advancedSearchTable[this.selectedSearchIndex];
    this.selectedSearchForm = new FormControl(this.selectedSearchIndex);
    if (trigger) { this.triggerAdavancedSearch() }
  }

  triggerAdavancedSearch(): void {

    if (this.advancedSearchArray.length === 0 || this.advancedSearchTable[this.selectedSearchIndex].parameters.length === 0) { return }
    const QUERY = "SELECT * FROM treasurylog WHERE ";
    let queryExtra = '';

    this.activeSearch.parameters.forEach((parameter, i) => {

      if (i !== 0) { queryExtra += ` ${parameter.type} ` }

      if (parameter.field === 'recurrencyid') {
        if (parameter.value === true) {
          queryExtra += `recurrencyid != '0'`;
        } else {
          queryExtra += `recurrencyid = '0'`;
        }
        return;
      }

      if (parameter.field === 'date') {

        let dayStart = new Date(Number(parameter.value));
        let dayEnd = new Date(Number(parameter.value));
        dayEnd.setDate(dayEnd.getDate() + 1)

        switch (parameter.condition) {
          case '=':
            queryExtra += `(date >= '${Number(dayStart.getTime())}' AND date < '${Number(dayEnd.getTime())}')`;
            break;

          case '!=':
            queryExtra += `(date < '${Number(dayStart.getTime())}' OR date >= '${Number(dayEnd.getTime())}')`;
            break;

          default:
            queryExtra += `${parameter.field} ${parameter.condition} '${parameter.value}'`;
        }
        return;
      }

      switch (parameter.condition) {
        case '~':
          queryExtra += `${parameter.field} LIKE '%${parameter.value}%'`;
          break;

        case '!~':
          queryExtra += `${parameter.field} NOT LIKE '%${parameter.value}%'`;
          break;

        default:
          queryExtra += `${parameter.field} ${parameter.condition} '${parameter.value}'`;
      }

    });

    queryExtra += ' ORDER BY date DESC'
    // return;
    let HTTP_PARAMS: HttpParams;

    HTTP_PARAMS = new HttpParams().set('type', 'tlog').set('query', QUERY + queryExtra);
    const CALL = this._http.post('http://localhost:16190/advancedtlogserach', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const ERROR_CODE = codeReceived as string[];
        if (ERROR_CODE[0] === 'MHQERROR') { return this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', ERROR_CODE[1], ['', '']); }
        const RESP = codeReceived as ITreasuryLog[];

        this.treasuryService.tLogTable = {}; RESP.forEach(tlog => { this.treasuryService.tLogTable[`'${tlog.id}'`] = tlog; });

        this.treasuryService.textSearchRefresh = true;
        this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/tlogs']); });

      },
      error: err => this._errorHandlingService.handleError(err)
    });



  }



  tlogSearch(reset: boolean = false, skipNav: boolean = false): void {

    if (reset) { this.treasuryNavbarInput = '' }

    let HTTP_PARAMS: HttpParams;

    HTTP_PARAMS = new HttpParams().set('type', 'tlog').set('search', this.treasuryNavbarInput)

    const CALL = this._http.post('http://localhost:16190/tlogsearch', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const ERROR_CODE = codeReceived as string[];
        if (ERROR_CODE[0] === 'MHQERROR') { return this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', ERROR_CODE[1], ['', '']); }
        const RESP = codeReceived as ITreasuryLog[];

        this.treasuryService.tLogTable = {}; RESP.forEach(tlog => { this.treasuryService.tLogTable[`'${tlog.id}'`] = tlog; });

        if (!skipNav) {
          this.treasuryService.textSearchRefresh = true;
          this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/tlogs']); });
        }
      },
      error: err => this._errorHandlingService.handleError(err)
    });
  }
}
