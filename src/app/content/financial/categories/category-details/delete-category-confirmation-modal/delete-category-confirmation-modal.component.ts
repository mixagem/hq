import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { ErrorHandlingService } from 'src/assets/services/misc.service';
import { TreasuryService } from '../../../treasury-log/treasury.service';
import { CategoriesService } from '../../categories.service';

@Component({
  selector: 'mhq-delete-category-confirmation-modal',
  templateUrl: './delete-category-confirmation-modal.component.html',
  styleUrls: ['./delete-category-confirmation-modal.component.scss']
})

export class DeleteCategoryConfirmationModalComponent {

  constructor(public categoriesService: CategoriesService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService, private _treasuryService: TreasuryService) { }

  deleteCategory(): void {

    // debugger;
    const categoryTLogs = this._treasuryService.treasuryLog.filter(tlog => tlog.cat == this.categoriesService.activePreviewCategory.id);
    if (categoryTLogs.length !== 0) { return alert('tens registos associados, that\'s illegal') }

    const httpParams = new HttpParams().set('cat', this.categoriesService.activePreviewCategory.id)
    const call = this._http.post('http://localhost:16190/deletecategory', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this.categoriesService.fetchCategories('deleteCategory'); },
      error: err => this._errorHandlingService.handleError(err)
    })

  }
}
