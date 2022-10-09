import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { CategoriesService } from '../categories.service';
import { Router } from '@angular/router';
import { IFinancialSubCategory } from 'src/assets/interfaces/ifinancial-sub-category';
import { MiscService, TimerService } from 'src/assets/services/misc.service';

// objectos default para modo de introdução de nova categoria/subcategorias
const DEFAULT_FICATEGORY: IFinancialCategory = {
  id: 0,
  type: 'expense',
  title: 'Nova categoria',
  icon: 'dns',
  bgcolor: 'rgb(0,0,0)',
  textcolor: 'rgb(255,255,255)',
  subcats: [],
  active: false
}

const DEFAULT_FISUBCATEGORY: IFinancialSubCategory = {
  id: Date.now(),
  maincat: 0,
  title: 'Nova sub-categoria',
  budget: 0,
  active: false
}

@Component({
  selector: 'mhq-new-category',
  templateUrl: './new-category.component.html',
  styleUrls: ['../../../../../assets/styles/mhq-mainform-details.scss']
})

export class NewCategoryComponent implements OnInit {

  // categoria utilizada no modo  de introdução
  tempFiCategory: IFinancialCategory;

  constructor(public categoriesService: CategoriesService, private _http: HttpClient, private _router: Router, private _timerService:TimerService) { }

  ngOnInit(): void {

    // cria a categoria temporária de acordo com o tipo de introdução
    if (this.categoriesService.cloningCategory) {
      // caso seja duplicação de um registo
      this.tempFiCategory = this.categoriesService.activePreviewCategory
      // reseta o id (apenas influência visualmente, na chamada à bd eu ignoro este campo)
      this.tempFiCategory.id = 0
    } else {
      // caso seja uma nova introduçãp
      this.tempFiCategory = JSON.parse(JSON.stringify(DEFAULT_FICATEGORY));
    }

  }

  // ações de registo
  newCategoryRecordActions(action: string): void {

    switch (action) {
      case 'save':
        this.categoriesService.recordBorderStyle['background-color'] = this.tempFiCategory.bgcolor
        this.createNewCategory();
        break;

      case 'end': default:
        // fechar a gaveta
        document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')

        // clearTimeout(this._timerService.timer);
        this._timerService.timer = setTimeout(navi.bind(null, this._router), 1000)
        function navi(router: Router): void {
          router.navigate(['/fi/cats'])
        }
    }
  }

  // concluí o modo de introdução (manda para bd, faz fresh à listagem e à gaveta)
  createNewCategory(): void {
    const httpParams = new HttpParams().set('cat', JSON.stringify(this.tempFiCategory))
    const call = this._http.post('http://localhost:16190/newcategory', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => {
        const createdCategoryAssignedID = codeReceived as unknown as number;
        this.categoriesService.fetchCategories('saveCategory', createdCategoryAssignedID);
      },
      error: err => this.categoriesService.handleError(err)
    })
  }

  // adicionar sub-categoria à categoria
  createSubcategory(): void {
    this.tempFiCategory.subcats.push({...DEFAULT_FISUBCATEGORY});
    console.log(this.tempFiCategory.subcats)
  }

  // remover sub-categoria da categoria
  deleteSubcategory(subCatIndex: number): void {
    let newSubcats: IFinancialSubCategory[] = [];
    this.tempFiCategory.subcats.forEach((subcat, i) => {
      if (subCatIndex !== i) { newSubcats.push(subcat) }
    });
    this.tempFiCategory.subcats = [...newSubcats];
  }

}