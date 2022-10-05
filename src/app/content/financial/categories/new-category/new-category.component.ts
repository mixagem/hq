import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { FinancialService } from '../../financial.service';
import { Router } from '@angular/router';
import { IFinancialSubCategory } from 'src/assets/interfaces/ifinancial-sub-category';

const DEFAULT_FICATEGORY = {
  id: 0,
  type: 'expense',
  title: 'temp',
  icon: 'dns',
  bgcolor: '0,0,0',
  textcolor: '255,255,255',
  subcats: [],
  active: false
}

@Component({
  selector: 'mhq-new-category',
  templateUrl: './new-category.component.html',
  styleUrls: ['../category-details/category-details.component.scss'] // utiliza os mesmos estilos que o category details
})

export class NewCategoryComponent implements OnInit {

  // categoria utilizada no modo  de introdução
  tempFiCategory: IFinancialCategory;

  // placeholders com as cores da categoria, para inputs dos colorpickers
  bgColorPicker: string;
  textColorPicker: string;

  constructor(public financialService: FinancialService, public _http: HttpClient, public _router: Router) { }

  ngOnInit(): void {

    // cria a categoria temporaária de acordo com o tipo de introdução
    if (this.financialService.cloningCategory) {
      this.tempFiCategory = this.financialService.activePreviewCategory
      this.tempFiCategory.id = 0
    } else {
      this.tempFiCategory = DEFAULT_FICATEGORY
    }

    this.bgColorPicker = this.tempFiCategory.bgcolor
    this.textColorPicker = this.tempFiCategory.textcolor
  }

  // quick-actions (save e discard)
  addCategoryActions(action: string): void {
    switch (action) {
      case 'save':
        // remover a parte do rgb(), e guardar apenas os valores
        this.tempFiCategory.bgcolor = this.bgColorPicker.replace('rgb(', '').replace(')', '');
        this.tempFiCategory.textcolor = this.textColorPicker.replace('rgb(', '').replace(')', '');
        this.saveCategory();
        break;

      case 'end': default:
        document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')
        const timer = setTimeout(navi.bind(null, this._router), 1000) // tempo da animação antes de redirecionar
        function navi(router: Router): void {
          router.navigate(['/fi/cats'])
        }
    }
  }

  // adicionar sub-categoria à respetiva tabela
  addSubCategory(): void {
    const tempSubcat: IFinancialSubCategory = {
      id: Date.now(),
      maincat: 0,
      title: 'Nova sub-categoria',
      budget: 0,
      active: false
    }
    this.tempFiCategory.subcats.push(tempSubcat)
  }

  // remover sub-categoria da respetiva tabela
  removeSubCategory(subCatIndex: number): void {
    let newSubcats: IFinancialSubCategory[] = [];
    this.tempFiCategory.subcats.forEach((subcat, i) => {
      if (subCatIndex !== i) { newSubcats.push(subcat) }
    });
    this.tempFiCategory.subcats = [...newSubcats];
  }

  // termina o modo de introdução (manda para bd, e encaminha o user para o modo de listgem, que é refrescado após a gaveta fechar)
  saveCategory(): void {
    const httpParams = new HttpParams().set('cat', JSON.stringify(this.tempFiCategory))
    const call = this._http.post('http://localhost:16190/addcat', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this.financialService.fetchCategories('addCategory'); },
      error: err => this.financialService.handleError(err)
    })
  }

}
