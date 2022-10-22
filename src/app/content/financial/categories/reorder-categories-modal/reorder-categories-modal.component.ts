import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { MHQSnackBarsService } from 'src/assets/services/mhq-snackbar.service';
import { ErrorHandlingService } from 'src/assets/services/misc.service';
import { CategoriesService } from '../categories.service';



@Component({
  selector: 'mhq-reorder-categories-modal',
  templateUrl: './reorder-categories-modal.component.html',
  styleUrls: ['./reorder-categories-modal.component.scss']
})
export class ReorderCategoriesModalComponent implements OnInit {

  categoriesToOrder: IFinancialCategory[]

  constructor(private _router:Router, private _mhqSnackbarService: MHQSnackBarsService, private _errorHandlingService: ErrorHandlingService, private _http: HttpClient, private _categoriesService: CategoriesService) { }

  ngOnInit(): void {
    this.categoriesToOrder = [...this._categoriesService.allCategories];
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.categoriesToOrder, event.previousIndex, event.currentIndex);
  }

  saveCategoriesOrder(): void {
    let categoryOrderArray: number[] = [];
    this.categoriesToOrder.forEach(cat => { categoryOrderArray.push(cat.id) });

    const HTTP_PARAMS = new HttpParams().set('newcatorder', JSON.stringify(categoryOrderArray))

    const CALL = this._http.post('http://localhost:16190/ordercategories', HTTP_PARAMS, { responseType: 'text' });
    CALL.subscribe({
      next: (codeReceived) => {
        switch (Number(codeReceived)) {
          case 1:
            this._categoriesService.fetchCategories();
            const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
            this._mhqSnackbarService.triggerMHQSnackbar(true, 'smiley', 're-ordenadas', ['As categorias foram ', ' com sucesso.']);
            this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/cats']); });
            this._categoriesService.onInitTriggerCall();

            break;

          case 0: default:
            this._mhqSnackbarService.triggerMHQSnackbar(false, 'alert', 're-ordenar', ['Algo inesperado ao ', ' as categorias.']);

        }




      },
      error: err => this._errorHandlingService.handleError(err)
    });
  }



}
