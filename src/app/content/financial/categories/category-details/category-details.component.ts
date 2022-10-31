import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { IFinancialSubCategory } from 'src/assets/interfaces/ifinancial-sub-category';
import { CategoriesService } from '../categories.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteCategoryConfirmationModalComponent } from './delete-category-confirmation-modal/delete-category-confirmation-modal.component';
import { ErrorHandlingService, LoadingService } from 'src/assets/services/misc.service';
import { MHQSnackBarsService } from '../../../../../assets/services/mhq-snackbar.service';

type RecordActions = 'edit' | 'save' | 'cancel'

@Component({
  selector: 'mhq-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['../../../../../assets/styles/mhq-mainform-details.scss']
})

export class CategoryDetailsComponent implements OnInit {
  firstLoadingComplete: boolean;

  id: number; // id da categoria em consulta
  cat: IFinancialCategory;  // clone da categoria utilizada em consulta
  tempCat: IFinancialCategory; // clone da categoria utilizada no modo  edição
  editingMode: boolean; // boolean com o estado do modo de edição

  constructor(private _mhqSnackbarService: MHQSnackBarsService, private _route: ActivatedRoute, public categoriesService: CategoriesService, private _http: HttpClient, private _dialog: MatDialog, private _errorHandlingService: ErrorHandlingService, public loadingService: LoadingService) {
    this.editingMode = false;
    this.firstLoadingComplete = false;
  }

  ngOnInit(): void {
    this.categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this.loadingService.categoriesLoadingComplete || this.firstLoadingComplete) { return }
    this.firstLoadingComplete = true;

    this.id = Number(this._route.snapshot.paramMap.get('id')!);
    this.cat = this.categoriesService.catTable[`'${this.id}'`];
    this.tempCat = JSON.parse(JSON.stringify(this.cat));
    this.categoriesService.activeCat = JSON.parse(JSON.stringify(this.cat));
    this.categoriesService.recordBorderStyle['background-color'] = this.cat.bgcolor;
  }

  // Ações de registo do modo de edição
  catRecordActions(action: RecordActions): void {
    switch (action) {
      case 'edit':
        this.categoriesService.getCurrentSubcategoriesSequence(); // obter o valor da sequencia de subcategorias
        this.tempCat = JSON.parse(JSON.stringify(this.cat));// refrescar o tempFi
        this.editingMode = true;
        break;

      case 'save':
        if (this.categoriesService.headerInputsValidation(this.tempCat)) { this.saveCatChanges(); }
        break;

      case 'cancel': default:
        this.editingMode = false;
    }
  }
  // Ação para guardar as alterações ao registo
  saveCatChanges(): void {
    const HTTP_PARAMS = new HttpParams().set('category', JSON.stringify(this.tempCat))
    const CALL = this._http.post('http://localhost:16190/updatecategory', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as string[];
        if (RESP[0] !== 'MHQERROR') {
          this.categoriesService.fetchCategories('saveCat', this.id); // atualiza o modo listagem / consulta
          this.categoriesService.recordBorderStyle['background-color'] = this.tempCat.bgcolor; // atualiza a cor do border da gaveta com a nova cor da categoria
          this.editingMode = false; // termina o modo de edição
          this._mhqSnackbarService.triggerMHQSnackbar(true, 'save_as', '', [RESP[0],'']); // dispara a snackbar
        }
        else {
          this._mhqSnackbarService.triggerMHQSnackbar(false, 'report_problem', '', [`${RESP.slice(1).join('<br>')}`, '']);
        }
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }
  // adicionar sub-categoria à categoria em edição
  attachSubcat(): void {
    const DEFAULT_FISUBCATEGORY: IFinancialSubCategory = { id: this.categoriesService.currentSubcategoryDBSequence + 1, maincatid: Number(this.id), title: 'Nova Sub-Categoria', budget: 0, active: false, order: 0 }
    this.tempCat.subcats.push(DEFAULT_FISUBCATEGORY);
    this.categoriesService.currentSubcategoryDBSequence++;
  }

  // remover sub-categoria à categoria em edição
  dettachSubcat(subcatIndex: number): void { this.tempCat.subcats = this.tempCat.subcats.filter(subcat => subcat.id !== subcatIndex); }

  // modal para apagar a categoria
  deleteCatModal(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this._dialog.open(DeleteCategoryConfirmationModalComponent, { width: '50vw', height: '50vh', enterAnimationDuration, exitAnimationDuration });
  }
}