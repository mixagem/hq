import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CategoriesService } from 'src/app/content/financial/categories/categories.service';
import { EfaturaService } from 'src/app/content/financial/efatura/efatura.service';
import { IAdvancedSearch } from 'src/shared/interfaces/iadanved-search';
import { IAdvancedSearchParameters } from 'src/shared/interfaces/iadanved-search-parameters';
import { IFinancialCategory } from 'src/shared/interfaces/ifinancial-category';
import { MHQSnackBarsService } from 'src/shared/services/mhq-snackbar.service';
import { ErrorHandlingService } from 'src/shared/services/misc.service';
import { AdvancedTreasurySearchService } from './advanced-treasury-search.service';
import { DeleteSearchModalComponent } from './delete-search-modal/delete-search-modal.component';

type CatTable = { [key: string]: IFinancialCategory };

@Component({
  selector: 'mhq-advanced-treasury-search',
  templateUrl: './advanced-treasury-search.component.html',
  styleUrls: ['../../../../../shared/styles/mhq-modal.scss', './advanced-treasury-search.component.scss']
})
export class AdvancedTreasurySearchComponent implements OnInit {

  editingMode: boolean;
  tempAdvancedSearch: IAdvancedSearch;
  currentSubcategoryDBSequence: number;
  insertMode: boolean;
  catTable: any[];
  subcatTable: any[];
  efatTable: any[];

  constructor(private _http: HttpClient, private _mhqSnackbarService: MHQSnackBarsService, private _errorHandlingService: ErrorHandlingService, private _dialog: MatDialog, public treasurySearchService: AdvancedTreasurySearchService, public categoriesService: CategoriesService, private _efaturaservice: EfaturaService) {
    this.catTable = [];
    this.subcatTable = [];
    this.efatTable = [];
  }


  ngOnInit(): void {
    for (let i = 0; i < Object.keys(this.categoriesService.catTable).length; i++) { this.catTable.push(this.categoriesService.catTable[Object.keys(this.categoriesService.catTable)[i]]) }
    for (let i = 0; i < Object.keys(this.categoriesService.subcatTable).length; i++) { this.subcatTable.push(this.categoriesService.subcatTable[Object.keys(this.categoriesService.subcatTable)[i]]) }
    for (let i = 0; i < Object.keys(this._efaturaservice.efaturaTable).length; i++) { this.efatTable.push(this._efaturaservice.efaturaTable[Number(Object.keys(this._efaturaservice.efaturaTable)[i])]) }

    this.treasurySearchService.waitingForSQL = false;
  }


  editSearchMode(): void {
    this.getCurrentSearchParamsSequence();
    this.tempAdvancedSearch = JSON.parse(JSON.stringify(this.treasurySearchService.advancedSearchTable[this.treasurySearchService.selectedSearchIndex]));
    this.tempAdvancedSearch.parameters.forEach(parameter => {
      if (parameter.field === 'date') { console.log(parameter.value ); parameter.value = new Date(Number(parameter.value));}
    });
    this.editingMode = true;
  }

  discardChanges(): void {
    this.editingMode = false;
    this.insertMode = false;
  }


  addSearchMode(): void {
    this.getCurrentSearchParamsSequence();
    this.insertMode = true;
    this.tempAdvancedSearch = { id: 0, title: 'Nova pesquisa avançada', active: true, entity: 'treasurylog', parameters: [] }
    this.addParameter();
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
    this.treasurySearchService.isTableReady = false;
    this.tempAdvancedSearch.parameters.forEach(parameter => {
      if (parameter.field === 'date') { parameter.value = new Date(parameter.value).getTime(); console.log(parameter.value) }

    });
    // return
    if (this.editingMode) {
      const HTTP_PARAMS = new HttpParams().set('search', JSON.stringify(this.tempAdvancedSearch))
      const CALL = this._http.post('http://localhost:16190/savesearch', HTTP_PARAMS, { responseType: 'json' });
      CALL.subscribe({
        next: (codeReceived) => {
          const ERROR_CODE = codeReceived as string[];
          if (ERROR_CODE[0] === 'MHQERROR') { return this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', ERROR_CODE[1], ['', '']); }
          this._mhqSnackbarService.triggerMHQSnackbar(true, 'save', '', [ERROR_CODE[0], '']);

          this.treasurySearchService.fetchAdavancedSearches(true);

          this.treasurySearchService.selectedSearchForm = new FormControl(this.treasurySearchService.selectedSearchIndex);
          this.treasurySearchService.activeSearch = this.tempAdvancedSearch;

          this.editingMode = false;
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

          this.treasurySearchService.selectedSearchIndex = Number(ERROR_CODE[1]);

          this.treasurySearchService.fetchAdavancedSearches(true);
          this.treasurySearchService.selectedSearchForm = new FormControl(this.treasurySearchService.selectedSearchIndex);
          this.treasurySearchService.activeSearch = this.tempAdvancedSearch;

          this.insertMode = false;
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
    this.treasurySearchService.activeSearch = JSON.parse(JSON.stringify(this.treasurySearchService.advancedSearchTable[this.treasurySearchService.selectedSearchIndex]));
    this._dialog.open(DeleteSearchModalComponent, { width: '50vw', height: '50vh', enterAnimationDuration, exitAnimationDuration });
  }
}