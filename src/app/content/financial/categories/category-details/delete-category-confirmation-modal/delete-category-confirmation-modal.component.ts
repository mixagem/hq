import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { MHQSnackBarsService } from 'src/assets/services/mhq-snackbar.service';
import { ErrorHandlingService } from 'src/assets/services/misc.service';
import { TreasuryService } from '../../../treasury-log/treasury.service';
import { CategoriesService } from '../../categories.service';

@Component({
  selector: 'mhq-delete-category-confirmation-modal',
  templateUrl: './delete-category-confirmation-modal.component.html',
  styles: ['.mhq-modal-header{background-color: var(--mhq-waikiki-danger)!important;}', '.mhq-category-modal-label{padding: 5px 10px;border-radius: 5px;}'],
  styleUrls: ['../../../../../../assets/styles/mhq-modal.scss']
})

export class DeleteCategoryConfirmationModalComponent {

  constructor(private _mhqSnackbarService: MHQSnackBarsService, public categoriesService: CategoriesService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService, private _treasuryService: TreasuryService) { }

  deleteCat(): void {
    // passar esta validação para o backend -v
    for (let i = 0; i < Object.keys(this._treasuryService.tLogTable).length; i++) {
      if (this._treasuryService.tLogTable[Object.keys(this._treasuryService.tLogTable)[i]].cat === this.categoriesService.activeCat.id) { return this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', this.categoriesService.activeCat.title, ['Não é possível remover a categoria ', ', devido à existência de movimentos associados a esta.']); }
    }

    const HTTP_PARAMS = new HttpParams().set('cat', JSON.stringify(this.categoriesService.activeCat))
    const CALL = this._http.post('http://localhost:16190/deletecategory', HTTP_PARAMS, { responseType: 'json' })
    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as string[];
        if (RESP[0] === 'MHQERROR') { this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', '', [RESP[1], '']) }
        else { this._mhqSnackbarService.triggerMHQSnackbar(true, 'recycling', '', [RESP[0], '']) }
        this.categoriesService.fetchCategories('deleteCat');
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }
}
