import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { IFinancialSubCategory } from 'src/assets/interfaces/ifinancial-sub-category';
import { FinancialService } from '../../financial.service';

@Component({
  selector: 'mhq-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.scss']
})
export class CategoryDetailsComponent implements OnInit {
  id: number;
  fiCategory: IFinancialCategory;
  editingMode: boolean;
  orderingSubCategories: boolean;
  tempFiCategory: IFinancialCategory;

  constructor(private _route: ActivatedRoute, private _financialService: FinancialService, public _router: Router, public _http: HttpClient) {
    this.editingMode = false;
    this.orderingSubCategories = false;
  }

  ngOnInit(): void {
    this.id = Number(this._route.snapshot.paramMap.get('id')!);
    this.fiCategory = [...this._financialService.expenseCategories, ...this._financialService.incomeCategories].filter(obj => {
      return obj.id === this.id
    })[0];
    this.tempFiCategory = JSON.parse(JSON.stringify(this.fiCategory));
  }

  saveCats(): void {
    const httpParams = new HttpParams().set('cat', JSON.stringify(this.tempFiCategory))
    const call = this._http.post('http://localhost:16190/savecat', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this.fetchCats(); this.editingMode = false;},
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
        this.ngOnInit();
      }, error: err => this._financialService.handleError(err)
    })
  }

  toggleEditing(action: string): void {
    switch (action) {
      case 'start':
        this.tempFiCategory = JSON.parse(JSON.stringify(this.fiCategory));
        this.editingMode = true;
        break;

      case 'save':
        this.saveCats();
        break;

      case 'end': default:
        this.editingMode = false;
    }
  }

  closeDetails(): void {
    document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')
    const timer = setTimeout(navi.bind(null, this._router), 800) // tempo da animação antes de redirecionar
    function navi(router: Router): void {
      router.navigate(['/fi/cats'])
    }
  }


  // redo: fazer qeury ao add À bd,
  // depois fazer re-query no service
  addSubCategory(catID: number) {

    const tempSubcat: IFinancialSubCategory = {
      id: Date.now(),
      maincat: catID,
      title: 'Nova sub-categoria',
      budget: 0,
      active: false
    }

    const httpParams = new HttpParams().set('subcat', JSON.stringify(tempSubcat))
    const call = this._http.post('http://localhost:16190/addsubcat', httpParams, { responseType: 'text' })
    call.subscribe({
      next: codeReceived => { this.fetchCats(); },
      error: err => this._financialService.handleError(err)
    })


  }


  // redo: fazer qeury ao add À bd,
  // depois fazer re-query no service
  removeSubCategory(subCatID: number, mainCatID: number): void {
    // obter objeto da categoria principal
    const mainCategory = [...this._financialService.expenseCategories, ...this._financialService.incomeCategories].filter(obj => {
      return obj.id === mainCatID;
    })[0];

    // obter array de categorias, de acordo com o tipo de despesa da categoria principal
    const categoriesArray = mainCategory.type === 'expense' ? [...this._financialService.expenseCategories] : [...this._financialService.incomeCategories];

    // obter o index da categoria, à qual a subcategoria a ser eliminada, pertence
    let catIndex = 0;
    categoriesArray.forEach((cat, i) => {
      if (cat.id === mainCatID) {
        catIndex = i; return;
      }
    });

    // obter array de subcategorias, à qual a subcategoria a ser eliminada, pertence
    const subcategoriesArray = [...categoriesArray][catIndex].subcats

    // obter o index da subcategoria a ser eliminada
    let subCatIndex = 0;
    subcategoriesArray.forEach((subCat, i) => {
      if (subCat.id === subCatID) {
        subCatIndex = i; return;
      }
    });

    // construção de novo array de subcategorias
    let finalSubCategoryArray: IFinancialSubCategory[] = [];
    subcategoriesArray.forEach((subCat, i) => {
      // faz push do subcategoriesArray, excepto para a subcategoria a eliminar
      i !== subCatIndex ? finalSubCategoryArray.push(subCat) : [];
    });

    // atualizar o array de sub-categorias, da categoria à qual a sub-categoria eliminada, pertencia
    mainCategory.type === 'expense' ? this._financialService.expenseCategories[catIndex].subcats = finalSubCategoryArray : this._financialService.incomeCategories[catIndex].subcats = finalSubCategoryArray;
    this.ngOnInit();
  }

}
