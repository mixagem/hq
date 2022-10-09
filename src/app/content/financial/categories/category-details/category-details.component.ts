import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { IFinancialSubCategory } from 'src/assets/interfaces/ifinancial-sub-category';
import { CategoriesService } from '../categories.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'mhq-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['../../../../../assets/styles/mhq-mainform-details.scss']
})

export class CategoryDetailsComponent implements OnInit {

  // id da categoria em consulta
  id: number;

  // clone da categoria utilizada em consulta
  fiCategory: IFinancialCategory;
  // clone da categoria utilizada no modo  edição
  tempFiCategory: IFinancialCategory;

  // boolean com o estado do modo de edição
  editingMode: boolean;

  constructor(private _route: ActivatedRoute, public categoriesService: CategoriesService, private _http: HttpClient, private _dialog: MatDialog) {
    this.editingMode = false;
  }

  ngOnInit(): void {

    //obter o id da categoria em consulta
    this.id = Number(this._route.snapshot.paramMap.get('id')!);

    // clone da categoria
    this.fiCategory = [...this.categoriesService.allCategories].filter(category => category.id === this.id)[0]

    // clone da categoria enviado para o serviço
    this.categoriesService.activePreviewCategory = { ...this.fiCategory }

    // clone da categoria para edição
    this.tempFiCategory = { ...this.fiCategory }

    // trigger remoto do OnInit
    this.categoriesService.onInitTrigger.subscribe(nono => {
      this.ngOnInit();
    });
  }

  // modal confirmar remoção da categoria
  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this._dialog.open(DeleteCategoryConfirmationModal, {
      width: '50vw',
      height: '50vh',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  // envia para bd as alterações efetuadas à categoria/sub-categorias
  saveCategory(): void {

    const httpParams = new HttpParams().set('cat', JSON.stringify(this.tempFiCategory))
    const call = this._http.post('http://localhost:16190/updatecategory', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => {
        this.categoriesService.fetchCategories('saveCategory', this.id);
        this.editingMode = false;
      },
      error: err => this.categoriesService.handleError(err)
    })

  }

  // Ações de registo do modo de edição
  editingCategoryRecordActions(action: string): void {
    switch (action) {

      case 'start':
        this.tempFiCategory = JSON.parse(JSON.stringify(this.fiCategory));
        this.editingMode = true;

        break;

      case 'save':
        this.categoriesService.recordBorderStyle['background-color'] = this.tempFiCategory.bgcolor;
        this.saveCategory();
        break;

      case 'end': default:
        this.editingMode = false;

    }
  }

  // adicionar sub-categoria à categoria em edição
  attachSubcategory(): void {

    const DEFAULT_FISUBCATEGORY: IFinancialSubCategory = {
      id: 0, //ignorado ao ser enviado para a bd
      maincat: this.id,
      title: 'Nova Sub-Categoria',
      budget: 0,
      active: false
    }

    const httpParams = new HttpParams().set('subcat', JSON.stringify(DEFAULT_FISUBCATEGORY))
    const call = this._http.post('http://localhost:16190/attachsubcat', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this.categoriesService.fetchCategories('', this.id); },
      error: err => this.categoriesService.handleError(err)
    })

  }

  // remover sub-categoria à categoria em edição
  dettachSubcategory(subCatID: number): void {

    const httpParams = new HttpParams().set('subcat', subCatID).set('cat', this.id)
    const call = this._http.post('http://localhost:16190/dettachsubcat', httpParams, { responseType: 'text' })
    call.subscribe({
      next: codeReceived => { this.categoriesService.fetchCategories('', this.id); },
      error: err => this.categoriesService.handleError(err)
    })
  }

}

// modal confirmação eliminação categoria
@Component({
  selector: 'delete-category-confirmation-modal',
  templateUrl: './delete-category-confirmation-modal.html',
  styleUrls: ['../../../../../assets/styles/mhq-large-modal.scss']
})

export class DeleteCategoryConfirmationModal {

  constructor(public categoriesService: CategoriesService, private _http: HttpClient) { }

  deleteCategory(): void {

    const httpParams = new HttpParams().set('cat', this.categoriesService.activePreviewCategory.id)
    const call = this._http.post('http://localhost:16190/deletecategory', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this.categoriesService.fetchCategories('deleteCategory'); },
      error: err => this.categoriesService.handleError(err)
    })

  }

}