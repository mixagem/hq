import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { CategoriesService } from '../categories.service';
import { Router } from '@angular/router';
import { IFinancialSubCategory } from 'src/assets/interfaces/ifinancial-sub-category';
import { ErrorHandlingService, TimerService } from 'src/assets/services/misc.service';
import { CategorySnackBarsService } from '../../../../../assets/services/snack-bars.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// objectos default para modo de introdução de nova categoria/subcategorias
const DEFAULT_FICATEGORY: IFinancialCategory = { id: 0, type: 'expense', title: 'Nova categoria', icon: 'dns', bgcolor: 'rgb(0,0,0)', textcolor: 'rgb(255,255,255)', subcats: [], active: false, order: 0 };
const DEFAULT_FISUBCATEGORY: IFinancialSubCategory = { id: Date.now(), maincatid: 0, title: 'Nova sub-categoria', budget: 0, active: false, order: 0 };

@Component({
  selector: 'mhq-new-category',
  templateUrl: './new-category.component.html',
  styleUrls: ['../../../../../assets/styles/mhq-mainform-details.scss']
})

export class NewCategoryComponent implements OnInit {
  tempFiCategory: IFinancialCategory; // categoria utilizada no modo de introdução
  constructor(public categoriesService: CategoriesService, private _http: HttpClient, private _router: Router, private _timerService: TimerService, private _categorySnackBarsService: CategorySnackBarsService, private _snackBar: MatSnackBar, private _errorHandlingService: ErrorHandlingService) { }

  ngOnInit(): void {
    // cria a categoria temporária de acordo com o tipo de introdução
    if (this.categoriesService.cloningCategory) {
      this.tempFiCategory = { ...this.categoriesService.activePreviewCategory }; // caso seja duplicação de um registo
      this.tempFiCategory.id = 0; // é preciso resetar o id (apenas influência visualmente, na chamada à bd eu ignoro este campo)
    } else {
      this.tempFiCategory = JSON.parse(JSON.stringify(DEFAULT_FICATEGORY)); // o rest operator não tava a bombar fixe aqui
    }
    this.categoriesService.recordBorderStyle['background-color']=this.tempFiCategory.bgcolor;
  }

  // ações de registo
  newCategoryRecordActions(action: string): void {
    switch (action) {
      case 'save':
        if (this.categoriesService.headerInputsValidation(this.tempFiCategory)) { this.createNewCategory(); }
        break;

      case 'end': default:
        document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight');
        this._timerService.timer = setTimeout(navi.bind(null, this._router), 1000);
        function navi(router: Router): void { router.navigate(['/fi/cats']) };
    }
  }

  // adicionar sub-categoria à categoria temporária
  createSubcategory(): void {
    this.tempFiCategory.subcats.push({ ...DEFAULT_FISUBCATEGORY });
  }

  // remover sub-categoria da categoria temporária
  deleteSubcategory(subcatIndex: number): void {
    this.tempFiCategory.subcats = this.tempFiCategory.subcats.filter((subcat, i) => subcatIndex !== i);
  }

  // concluí o modo de introdução (manda para bd, faz fresh à listagem e à gaveta)
  createNewCategory(): void {
    const HTTP_PARAMS = new HttpParams().set('category', JSON.stringify(this.tempFiCategory));
    const CALL = this._http.post('http://localhost:16190/createnewcategory', HTTP_PARAMS, { responseType: 'text' });
    CALL.subscribe({
      next: codeReceived => {
        if (codeReceived !== 'MHQ_ERROR') {
          this.categoriesService.fetchCategories('saveCategory', Number(codeReceived)); // atualiza o modo listagem / consulta
          this.categoriesService.recordBorderStyle['background-color'] = this.tempFiCategory.bgcolor; // atualiza a cor do border da gaveta com da nova categoria
          this._categorySnackBarsService.triggerCategoriesSnackbar(true, 'playlist_add', this.tempFiCategory.title, ['A categoria ', ' foi criada com sucesso.']); // dispara a snackbar
        } else {
          this._categorySnackBarsService.triggerCategoriesSnackbar(false, 'report', this.tempFiCategory.title, ['Ocurreu um erro ao guardar as alterações à categoria ', '.']);
        }
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }

}