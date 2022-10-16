import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { CategorySnackBarsService } from 'src/assets/services/snack-bars.service';
import { ErrorHandlingService } from 'src/assets/services/misc.service';
import { TreasuryService } from '../../../treasury-log/treasury.service';
import { CategoriesService } from '../../categories.service';

@Component({
  selector: 'mhq-delete-category-confirmation-modal',
  templateUrl: './delete-category-confirmation-modal.component.html',
  styleUrls: ['./delete-category-confirmation-modal.component.scss']
})

export class DeleteCategoryConfirmationModalComponent {

  constructor(private _categorySnackBarsService: CategorySnackBarsService, public categoriesService: CategoriesService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService, private _treasuryService: TreasuryService) { }

  deleteCategory(): void {

    for (let i = 0; i < this._treasuryService.treasuryLog.length; i++) {
      if(this._treasuryService.treasuryLog[i].cat === this.categoriesService.activePreviewCategory.id) {return this._categorySnackBarsService.triggerCategoriesSnackbar(false, 'report', this.categoriesService.activePreviewCategory.title, ['Não é possível remover a categoria ', ', devido à existência de movimentos associados a esta.']);}
    }

    const httpParams = new HttpParams().set('cat', this.categoriesService.activePreviewCategory.id)
    const call = this._http.post('http://localhost:16190/deletecategory', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this.categoriesService.fetchCategories('deleteCategory'); },
      error: err => this._errorHandlingService.handleError(err)
    })

  }
}
