import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { ErrorHandlingService } from 'src/assets/services/misc.service';
import { CategoriesService } from '../../categories.service';

@Component({
  selector: 'mhq-delete-category-confirmation-modal',
  templateUrl: './delete-category-confirmation-modal.component.html',
  styleUrls: ['./delete-category-confirmation-modal.component.scss']
})

export class DeleteCategoryConfirmationModalComponent {

  constructor(public categoriesService: CategoriesService, private _http: HttpClient, private _errorHandlingService: ErrorHandlingService) { }

  deleteCategory(): void {

    const httpParams = new HttpParams().set('cat', this.categoriesService.activePreviewCategory.id)
    const call = this._http.post('http://localhost:16190/deletecategory', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this.categoriesService.fetchCategories('deleteCategory'); },
      error: err => this._errorHandlingService.handleError(err)
    })

  }
}
