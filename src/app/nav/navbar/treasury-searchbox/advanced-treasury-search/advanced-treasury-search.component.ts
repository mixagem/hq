import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogTitle } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { DeleteCategoryConfirmationModalComponent } from 'src/app/content/financial/categories/category-details/delete-category-confirmation-modal/delete-category-confirmation-modal.component';
import { IAdvancedSearch } from 'src/shared/interfaces/iadanved-search';
import { IAdvancedSearchParameters } from 'src/shared/interfaces/iadanved-search-parameters';
import { MHQSnackBarsService } from 'src/shared/services/mhq-snackbar.service';
import { ErrorHandlingService } from 'src/shared/services/misc.service';
import { AdvancedTreasurySearchService } from './advanced-treasury-search.service';
import { DeleteSearchModalComponent } from './delete-search-modal/delete-search-modal.component';

type AdvancedSearchTable = { [key: number]: IAdvancedSearch }

@Component({
  selector: 'mhq-advanced-treasury-search',
  templateUrl: './advanced-treasury-search.component.html',
  styleUrls: ['../../../../../shared/styles/mhq-modal.scss', './advanced-treasury-search.component.scss']
})
export class AdvancedTreasurySearchComponent implements OnInit {

  advancedSearchArray: IAdvancedSearch[];
  advancedSearchTable: AdvancedSearchTable;
  isTableReady: boolean;
  selectedSearchIndex: number;
  selectedSearchForm: FormControl;
  editingMode: boolean;
  tempAdvancedSearch: IAdvancedSearch;
  currentSubcategoryDBSequence: number;
  waitingForSQL: boolean;
  insertMode: boolean;

  constructor(private _http: HttpClient, private _mhqSnackbarService: MHQSnackBarsService, private _errorHandlingService: ErrorHandlingService, private _dialog: MatDialog, private _treasurySearchService: AdvancedTreasurySearchService) {
    this.waitingForSQL = false;
    this.selectedSearchIndex = 0;
  }

  ngOnInit(): void {
    this.editingMode = false;
    this.insertMode = false;
    this.isTableReady = false;
    this.selectedSearchForm = new FormControl(this.selectedSearchIndex);
    this.advancedSearchArray = [];
    this.advancedSearchTable = {};
    this.getCurrentSearchParamsSequence();
    this.fetchAdavancedSearches();
  }

  fetchAdavancedSearches(): void {

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
        }

        this.isTableReady = true;
      },
      error: err => this._errorHandlingService.handleError(err)
    });
  }

  editSearchMode(): void {
    this.getCurrentSearchParamsSequence();
    this.tempAdvancedSearch = JSON.parse(JSON.stringify(this.advancedSearchTable[this.selectedSearchIndex]));
    this.editingMode = true;
  }

  discardChanges(): void {
    this.editingMode = false;
    this.insertMode = false;
  }


  addSearchMode(): void {
    this.insertMode = true;
    this.tempAdvancedSearch = { id: 0, title: 'Nova pesquisa avançada', active: true, entity: 'treasurylog', parameters: [] }
    this.addParameter();
  }

  changedSearch(event: MatSelectChange): void {
    this.selectedSearchIndex = event.value;
  }

  addParameter(): void {
    const DEFAULT_PARAMETER: IAdvancedSearchParameters = { id: this.currentSubcategoryDBSequence + 1, type: 'AND', field: 'title', condition: '=', value: '' }
    this.tempAdvancedSearch.parameters.push(DEFAULT_PARAMETER);
    this.currentSubcategoryDBSequence++;
  }

  removeParameter(paramID: number): void {
    let tempParams: IAdvancedSearchParameters[] = [];
    this.tempAdvancedSearch.parameters.forEach(param => {
      if (param.id !== paramID) { tempParams.push(param) }
    });
    this.tempAdvancedSearch.parameters = tempParams;
  }

  saveSearch(): void {

    this.waitingForSQL = true;

    if (this.editingMode) {
      const HTTP_PARAMS = new HttpParams().set('search', JSON.stringify(this.tempAdvancedSearch))
      const CALL = this._http.post('http://localhost:16190/savesearch', HTTP_PARAMS, { responseType: 'json' });

      CALL.subscribe({
        next: (codeReceived) => {
          const ERROR_CODE = codeReceived as string[];
          if (ERROR_CODE[0] === 'MHQERROR') { return this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', ERROR_CODE[1], ['', '']); }
          this._mhqSnackbarService.triggerMHQSnackbar(true, 'save', '', [ERROR_CODE[0], '']);
          this.waitingForSQL = false;
          this.ngOnInit();
        },
        error: err => this._errorHandlingService.handleError(err)
      });
    }

    if (this.insertMode) {
      const HTTP_PARAMS = new HttpParams().set('search', JSON.stringify(this.tempAdvancedSearch))
      const CALL = this._http.post('http://localhost:16190/addnewsearch', HTTP_PARAMS, { responseType: 'json' });

      CALL.subscribe({
        next: (codeReceived) => {
          const ERROR_CODE = codeReceived as string[];
          if (ERROR_CODE[0] === 'MHQERROR') { return this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', '', [ERROR_CODE[1], '']); }
          this._mhqSnackbarService.triggerMHQSnackbar(true, 'save', '', [ERROR_CODE[0], '']);
          this.waitingForSQL = false;
          this.selectedSearchIndex = Number(ERROR_CODE[1]);
          this.ngOnInit();
        },
        error: err => this._errorHandlingService.handleError(err)
      });
    }
  }

  // método para obter o último id utilizado nas categorias em bd
  getCurrentSearchParamsSequence(): void {
    const CALL = this._http.get('http://localhost:16190/currentsearchparamssequence', { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const RESP = codeReceived as string[];
        if (RESP[0] === 'MHQERROR') { this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', RESP[1], ['', '']); location } else {
          this.currentSubcategoryDBSequence = Number(RESP[0]);
        }
      },
      error: err => { this._errorHandlingService.handleError(err); }
    });
  }

  deleteSearch(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this._treasurySearchService.activeSearch = JSON.parse(JSON.stringify(this.advancedSearchTable[this.selectedSearchIndex]));
    this._dialog.open(DeleteSearchModalComponent, { width: '50vw', height: '50vh', enterAnimationDuration, exitAnimationDuration });
  }
  // searchID: number
}