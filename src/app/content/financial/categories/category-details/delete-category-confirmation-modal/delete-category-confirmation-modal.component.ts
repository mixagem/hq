import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { MHQSnackBarsService } from 'src/assets/services/mhq-snackbar.service';
import { ErrorHandlingService } from 'src/assets/services/misc.service';
import { TreasuryService } from '../../../treasury-log/treasury.service';
import { CategoriesService } from '../../categories.service';

@Component({
  selector: 'mhq-delete-category-confirmation-modal',
  templateUrl: './delete-category-confirmation-modal.component.html',
  styles: ['.mhq-modal-header{background-color: var(--mhq-waikiki-danger)!important;}','.mhq-category-modal-label{padding: 5px 10px;border-radius: 5px;}'],
  styleUrls: ['../../../../../../assets/styles/mhq-modal.scss']
})

export class DeleteCategoryConfirmationModalComponent {

  constructor(private _mhqSnackbarService: MHQSnackBarsService, public categoriesService: CategoriesService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService, private _treasuryService: TreasuryService) { }

  deleteCategory(): void {
    for (let i = 0; i < this._treasuryService.treasuryLog.length; i++) {
      if (this._treasuryService.treasuryLog[i].cat === this.categoriesService.activePreviewCategory.id) { return this._mhqSnackbarService.triggerMHQSnackbar(false, 'report', this.categoriesService.activePreviewCategory.title, ['Não é possível remover a categoria ', ', devido à existência de movimentos associados a esta.']); }
    }
    const HTTP_PARAMS = new HttpParams().set('cat', this.categoriesService.activePreviewCategory.id)
    const CALL = this._http.post('http://localhost:16190/deletecategory', HTTP_PARAMS, { responseType: 'text' })
    CALL.subscribe({
      next: codeReceived => { this.categoriesService.fetchCategories('deleteCategory'); },
      error: err => this._errorHandlingService.handleError(err)
    })
  }
}
