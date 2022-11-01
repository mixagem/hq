import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { IFinancialCategory } from 'src/shared/interfaces/ifinancial-category';
import { IFinancialSubCategory } from 'src/shared/interfaces/ifinancial-sub-category';
import { MHQSnackBarsService } from 'src/shared/services/mhq-snackbar.service';
import { ErrorHandlingService } from 'src/shared/services/misc.service';
import { CategoriesService } from '../categories.service';

type SelectEnum = { title: string, value: number }

@Component({
  selector: 'mhq-reorder-categories-modal',
  templateUrl: './reorder-categories-modal.component.html',
  styleUrls: ['./reorder-categories-modal.component.scss', '../../../../../shared/styles/mhq-modal.scss']
})

export class ReorderCategoriesModalComponent implements OnInit {

  catsToOrder: IFinancialCategory[]
  subCatsToOrder: IFinancialSubCategory[];
  catForm: FormControl   // autocomplete categoria
  catList: SelectEnum[] = [];
  tabIndex: number; // tabulador atual

  constructor(private _mhqSnackbarService: MHQSnackBarsService, private _errorHandlingService: ErrorHandlingService, private _http: HttpClient, public categoriesService: CategoriesService) { }

  ngOnInit(): void {
    this.catsToOrder = [];
    for (let i = 0; i < Object.keys(this.categoriesService.catTable).length; i++) {
      this.catsToOrder.push(this.categoriesService.catTable[Object.keys(this.categoriesService.catTable)[i]])
    };
    this.catForm = new FormControl('', [Validators.required]);
    this.catsToOrder.forEach(cat => {
      this.catList.push({ title: cat.title, value: cat.id })
    });
    this.tabIndex = 0;
    this.subCatsToOrder = [];
  }

  catDrop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.catsToOrder, event.previousIndex, event.currentIndex);
  }

  subcatDrop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.subCatsToOrder, event.previousIndex, event.currentIndex);
  }

  tabChanged(event: MatTabChangeEvent): void {
    this.tabIndex = event.index;
  }
  saveCatsOrder(): void {
    let categoryOrderArray: number[] = [];
    this.catsToOrder.forEach(cat => { categoryOrderArray.push(cat.id) });

    const HTTP_PARAMS = new HttpParams().set('newcatorder', JSON.stringify(categoryOrderArray))
    const CALL = this._http.post('http://localhost:16190/ordercategories', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const RESP = codeReceived as string[];
        if (RESP[0] === 'MHQERROR') { this._mhqSnackbarService.triggerMHQSnackbar(false, 'sync_problem', 're-ordenar', ['Algo inesperado ao ', ' as categorias.']); return }
        this.categoriesService.fetchCategories('reorderCat');
        const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
        this._mhqSnackbarService.triggerMHQSnackbar(true, 'sync_lock', '', [RESP[0],'']);
      },
      error: err => this._errorHandlingService.handleError(err)
    });
  }

  saveSubcatsOrder(): void {
    let subCategoryOrderArray: number[] = [];
    this.subCatsToOrder.forEach(subcat => { subCategoryOrderArray.push(subcat.id) });

    const HTTP_PARAMS = new HttpParams().set('newsubcatorder', JSON.stringify(subCategoryOrderArray))
    const CALL = this._http.post('http://localhost:16190/ordersubcategories', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const RESP = codeReceived as string[];

        if (RESP[0] === 'MHQERROR') { this._mhqSnackbarService.triggerMHQSnackbar(false, 'sync_problem', 're-ordenar', ['Algo inesperado ao ', ' as sub-categorias.']); return }

        this.categoriesService.fetchCategories();
        const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
        this._mhqSnackbarService.triggerMHQSnackbar(true, 'sync_lock', '', [RESP[0],'']);

      },
      error: err => this._errorHandlingService.handleError(err)
    });
  }

  catChanged(event: MatSelectChange): void {
    const CATEGORY: IFinancialCategory = this.categoriesService.catTable[`'${event.value}'`];
    this.subCatsToOrder = [];
    CATEGORY.subcats.forEach(subcat => { this.subCatsToOrder.push(subcat) });
  }
}
