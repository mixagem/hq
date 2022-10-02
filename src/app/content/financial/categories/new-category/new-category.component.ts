import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { FinancialService } from '../../financial.service';
import { Router } from '@angular/router';
import { IFinancialSubCategory } from 'src/assets/interfaces/ifinancial-sub-category';

@Component({
  selector: 'mhq-new-category',
  templateUrl: './new-category.component.html',
  styleUrls: ['./new-category.component.scss']
})
export class NewCategoryComponent {

  tempFiCategory: IFinancialCategory;

  constructor(private _financialService: FinancialService, public _http: HttpClient, public _router: Router) {
    this.tempFiCategory = {
      id: 0,
      type: 'expense',
      title: 'temp',
      icon: 'dns',
      bgcolor: '0,0,0',
      textcolor: '255,255,255',
      subcats: [],
      active: false
    };
  }

  addCategoryActions(action: string): void {
    switch (action) {
      case 'save':
        this.addCategory();
        break;

      case 'end': default:
        document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')
        const timer = setTimeout(navi.bind(null, this._router), 1000) // tempo da animação antes de redirecionar
        function navi(router: Router): void {
          router.navigate(['/fi/cats'])
        }
    }
  }

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

  removeSubCategory(subCatIndex: number): void {
    let newSubcats: IFinancialSubCategory[] = [];
    this.tempFiCategory.subcats.forEach((subcat, i) => {
      if (subCatIndex !== i) { newSubcats.push(subcat) }
    });
    this.tempFiCategory.subcats = [...newSubcats];
  }

  addCategory(): void {
    const httpParams = new HttpParams().set('cat', JSON.stringify(this.tempFiCategory))
    const call = this._http.post('http://localhost:16190/addcat', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this.fetchCats(); },
      error: err => this._financialService.handleError(err)
    })
  }


  fetchCats() {
    const call = this._http.get('http://localhost:16190/getcats')
    call.subscribe({
      next: (codeReceived) => {
        const resp = codeReceived as IFinancialCategory[];
        this._financialService.expenseCategories = resp.filter(cat => cat.type === 'expense');
        this._financialService.incomeCategories = resp.filter(cat => cat.type === 'income');
        document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')
        const timer = setTimeout(navi.bind(null, this._router), 1000) // tempo da animação antes de redirecionar
        function navi(router: Router): void {
          router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            router.navigate(['/fi/cats']));
        }
      }, error: err => this._financialService.handleError(err)
    })
  }

}
