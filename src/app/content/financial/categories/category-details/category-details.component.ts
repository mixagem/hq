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
  id: string;
  fiCategory: IFinancialCategory;
  editingSubCategories: boolean;
  orderingSubCategories: boolean;
  tempFiCategory: IFinancialCategory;

  constructor(private _route: ActivatedRoute, private _financialService: FinancialService, public _router: Router) {
    this.editingSubCategories = false;
    this.orderingSubCategories = false;


  }

  ngOnInit(): void {
    this.id = this._route.snapshot.paramMap.get('id')!;
    this.fiCategory = [...this._financialService.expanseCategories, ...this._financialService.incomeCategories].filter(obj => {
      return obj.id === this.id
    })[0];
    this.tempFiCategory = JSON.parse(JSON.stringify(this.fiCategory));
  }

  toggleEditing(action: string): void {
    switch (action) {
      case 'start':
        this.tempFiCategory = JSON.parse(JSON.stringify(this.fiCategory));
        this.editingSubCategories = true;
        break;

      case 'save':
        const categoriesArray = this.fiCategory.type === 'expense' ? [...this._financialService.expanseCategories] : [...this._financialService.incomeCategories];
        let catIndex = 0;
        categoriesArray.forEach((cat, i) => {
          if (cat.id === this.fiCategory.id) {
            catIndex = i; return;
          }
        });
        this.fiCategory.type === 'expense' ? this._financialService.expanseCategories[catIndex] = this.tempFiCategory : this._financialService.incomeCategories[catIndex] = { ...this.tempFiCategory };
        this.editingSubCategories = false;
        this.ngOnInit();
        break;

      case 'end': default:
        this.editingSubCategories = false;
    }
  }

  closeDetails(): void {
    document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')
    const timer = setTimeout(navi.bind(null, this._router), 800) // tempo da animação antes de redirecionar
    function navi(router: Router): void {
      router.navigate(['/fi/cats'])
    }
  }



  addSubCategory(mainCatID: string) {
    // obter objeto da categoria principal
    const mainCategory = [...this._financialService.expanseCategories, ...this._financialService.incomeCategories].filter(obj => {
      return obj.id === mainCatID;
    })[0];

    // obter array de categorias, de acordo com o tipo de despesa da categoria principal
    const categoriesArray = mainCategory.type === 'expense' ? [...this._financialService.expanseCategories] : [...this._financialService.incomeCategories];

    // obter o index da categoria, à qual a subcategoria a ser eliminada, pertence
    let catIndex = 0;
    categoriesArray.forEach((cat, i) => {
      if (cat.id === mainCatID) {
        catIndex = i; return;
      }
    });

    const newSubcat: IFinancialSubCategory = {
      id: 'temp-id-' + Date.now(),
      maincat: mainCategory.id,
      title: 'Nova sub-categoria',
      budget: 0,
      active: false
    }
    mainCategory.type === 'expense' ? this._financialService.expanseCategories[catIndex].subcats.push(newSubcat) : this._financialService.incomeCategories[catIndex].subcats.push(newSubcat);
    this.ngOnInit();
  }

  removeSubCategory(subCatID: string, mainCatID: string): void {
    // obter objeto da categoria principal
    const mainCategory = [...this._financialService.expanseCategories, ...this._financialService.incomeCategories].filter(obj => {
      return obj.id === mainCatID;
    })[0];

    // obter array de categorias, de acordo com o tipo de despesa da categoria principal
    const categoriesArray = mainCategory.type === 'expense' ? [...this._financialService.expanseCategories] : [...this._financialService.incomeCategories];

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
    mainCategory.type === 'expense' ? this._financialService.expanseCategories[catIndex].subcats = finalSubCategoryArray : this._financialService.incomeCategories[catIndex].subcats = finalSubCategoryArray;
    this.ngOnInit();
  }

}
