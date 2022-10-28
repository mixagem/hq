import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { IFinancialSubCategory } from 'src/assets/interfaces/ifinancial-sub-category';
import { MHQSnackBarsService } from 'src/assets/services/mhq-snackbar.service';
import { ErrorHandlingService } from 'src/assets/services/misc.service';
import { CategoriesService } from '../categories.service';

@Component({
  selector: 'mhq-reorder-categories-modal',
  templateUrl: './reorder-categories-modal.component.html',
  styleUrls: ['./reorder-categories-modal.component.scss', '../../../../../assets/styles/mhq-modal.scss']
})

export class ReorderCategoriesModalComponent implements OnInit {

  categoriesToOrder: IFinancialCategory[]
  subCategoriesToOrder: IFinancialSubCategory[];
  catForm: FormControl   // autocomplete categoria
  categoriesList: string[] = [];
  tabIndex: number; // tabulador atual

  constructor(private _router: Router, private _mhqSnackbarService: MHQSnackBarsService, private _errorHandlingService: ErrorHandlingService, private _http: HttpClient, public categoriesService: CategoriesService) { }

  ngOnInit(): void {
    this.categoriesToOrder = [...this.categoriesService.allCategories];
    this.catForm = new FormControl('', [Validators.required]);
    this.categoriesToOrder.forEach(cat => {
      this.categoriesList.push(cat.title)
    });
    this.tabIndex = 0;
    this.subCategoriesToOrder = [];
  }

  catDrop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.categoriesToOrder, event.previousIndex, event.currentIndex);
  }

  subcatDrop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.subCategoriesToOrder, event.previousIndex, event.currentIndex);
  }

  changedTab(event: MatTabChangeEvent): void {
    this.tabIndex = event.index;
  }
  saveCategoriesOrder(): void {
    let categoryOrderArray: number[] = [];
    this.categoriesToOrder.forEach(cat => { categoryOrderArray.push(cat.id) });

    const HTTP_PARAMS = new HttpParams().set('newcatorder', JSON.stringify(categoryOrderArray))
    const CALL = this._http.post('http://localhost:16190/ordercategories', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const RESP = codeReceived as string[];
        if (RESP[0] === 'MHQERROR') { this._mhqSnackbarService.triggerMHQSnackbar(false, 'sync_problem', 're-ordenar', ['Algo inesperado ao ', ' as categorias.']); return }
        this.categoriesService.fetchCategories();
        const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
        this._mhqSnackbarService.triggerMHQSnackbar(true, 'sync_lock', 're-ordenadas', ['As categorias foram ', ' com sucesso.']);
        this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/cats']); });
        this.categoriesService.onInitTriggerCall();
      },
      error: err => this._errorHandlingService.handleError(err)
    });
  }

  saveSubCategoriesOrder(): void {
    let subCategoryOrderArray: number[] = [];
    this.subCategoriesToOrder.forEach(subcat => { subCategoryOrderArray.push(subcat.id) });

    const HTTP_PARAMS = new HttpParams().set('newsubcatorder', JSON.stringify(subCategoryOrderArray))
    const CALL = this._http.post('http://localhost:16190/ordersubcategories', HTTP_PARAMS, { responseType: 'text' });
    CALL.subscribe({
      next: (codeReceived) => {
        switch (Number(codeReceived)) {
          case 1:
            this.categoriesService.fetchCategories();
            const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
            this._mhqSnackbarService.triggerMHQSnackbar(true, 'smile', 're-ordenadas', ['As sub-categorias foram ', ' com sucesso.']);
            this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/cats']); });
            this.categoriesService.onInitTriggerCall();

            break;

          case 0: default:
            this._mhqSnackbarService.triggerMHQSnackbar(false, 'alert', 're-ordenar', ['Algo inesperado ao ', ' as sub-categorias.']);
        }
      },
      error: err => this._errorHandlingService.handleError(err)
    });
  }

  categorySelectChanged(event: MatSelectChange): void {
    const CATEGORY: IFinancialCategory = this.categoriesService.catTitleEnum[event.value];
    this.subCategoriesToOrder = [];
    CATEGORY.subcats.forEach(subcat => { this.subCategoriesToOrder.push(subcat) });
  }
}
