import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { IFinancialSubCategory } from 'src/assets/interfaces/ifinancial-sub-category';
import { CategoriesService } from '../categories.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteCategoryConfirmationModalComponent } from './delete-category-confirmation-modal/delete-category-confirmation-modal.component';
import { ErrorHandlingService, MiscService } from 'src/assets/services/misc.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategorySnackBarsService } from '../../../../../assets/services/category-snack-bars.service';

@Component({
  selector: 'mhq-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['../../../../../assets/styles/mhq-mainform-details.scss']
})

export class CategoryDetailsComponent implements OnInit {

  id: number; // id da categoria em consulta
  fiCategory: IFinancialCategory;  // clone da categoria utilizada em consulta
  tempFiCategory: IFinancialCategory; // clone da categoria utilizada no modo  edição
  editingMode: boolean; // boolean com o estado do modo de edição

  constructor(private _categorySnackBarsService: CategorySnackBarsService, private _snackBar: MatSnackBar, private _route: ActivatedRoute, public categoriesService: CategoriesService, private _http: HttpClient, private _dialog: MatDialog, public miscService: MiscService, private _errorHandlingService: ErrorHandlingService) {
    this.editingMode = false;
  }

  ngOnInit(): void {
    //obter o id da categoria em consulta
    this.id = Number(this._route.snapshot.paramMap.get('id'));

    // obter a categoria
    this.fiCategory = this.miscService.getCategory(this.id);
    // clone da categoria para edição
    this.tempFiCategory = JSON.parse(JSON.stringify(this.fiCategory));
    // clone da categoria enviado para o serviço -> utilizado para a duplicação (o componente de introdução vai ler ao servico o objeto da categoria)
    this.categoriesService.activePreviewCategory = JSON.parse(JSON.stringify(this.fiCategory));

    // trigger remoto do OnInit
    this.categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
  }

  // Ações de registo do modo de edição
  editingCategoryRecordActions(action: string): void {
    switch (action) {

      case 'edit':

        this.categoriesService.getCurrentSubcategoriesSequence(); // obter o valor da sequencia de subcategorias
        this.tempFiCategory = JSON.parse(JSON.stringify(this.fiCategory));// refrescar o tempFi
        this.editingMode = true;

        break;

      case 'save':

        if (this.categoriesService.headerInputsValidation(this.tempFiCategory)) { this.saveCategoryChanges(); }

        break;

      case 'end': default:
        this.editingMode = false;
    }
  }

  // adicionar sub-categoria à categoria em edição
  attachSubcategory(): void {
    const DEFAULT_FISUBCATEGORY: IFinancialSubCategory = { id: this.categoriesService.currentSubcategoryDBSequence + 1, maincatid: this.id, title: 'Nova Sub-Categoria', budget: 0, active: false, order: 0 }
    this.tempFiCategory.subcats.push(DEFAULT_FISUBCATEGORY);
    this.categoriesService.currentSubcategoryDBSequence++;
  }

  // remover sub-categoria à categoria em edição
  dettachSubcategory(subcatIndex: number): void {
    this.tempFiCategory.subcats = this.tempFiCategory.subcats.filter(subcat => subcat.id !== subcatIndex);
  }

  // Ação para guardar as alterações ao registo
  saveCategoryChanges(): void {

    const httpParams = new HttpParams().set('category', JSON.stringify(this.tempFiCategory))
    const call = this._http.post('http://localhost:16190/updatecategory', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => {

        if (Number(codeReceived) === 1) {
          this.categoriesService.fetchCategories('saveCategory', this.id); // atualiza o modo listagem / consulta
          this.categoriesService.recordBorderStyle['background-color'] = this.tempFiCategory.bgcolor; // atualiza a cor do border da gaveta com a nova cor da categoria
          this.editingMode = false; // termina o modo de edição
          this._categorySnackBarsService.triggerCategoriesSnackbar(true, 'save_as', this.tempFiCategory.title, ['A categoria ', ' foi atualizada com sucesso.']); // dispara a snackbar
        }
        else {
          this._categorySnackBarsService.triggerCategoriesSnackbar(false, 'report', this.tempFiCategory.title, ['Ocurreu um erro ao guardar as alterações à categoria ', '.']);
        }

      },
      error: err => this._errorHandlingService.handleError(err)
    })

  }

  // modal para apagar a categoria
  deleteCategoryModal(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this._dialog.open(DeleteCategoryConfirmationModalComponent, { width: '50vw', height: '50vh', enterAnimationDuration, exitAnimationDuration });
  }

}