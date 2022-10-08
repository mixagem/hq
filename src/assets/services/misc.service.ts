import { Injectable } from '@angular/core';
import { CategoriesService } from 'src/app/content/financial/categories/categories.service';
import { IFinancialCategory } from '../interfaces/ifinancial-category';
import { IFinancialSubCategory } from '../interfaces/ifinancial-sub-category';

@Injectable({
  providedIn: 'root'
})
export class MiscService {

  constructor(private _categoriesService: CategoriesService) {}

  getCategoryIDFromSubcategoryID(subcatID: number): number {
    // debugger;
    let category: IFinancialCategory;

    [...this._categoriesService.allCategories].forEach(cat => {
      cat.subcats.forEach(subcat => {
        if (subcat.id === subcatID) { category = cat }
      });
    });

    return category!.id;
  }

  getCategoryIconFromSubcategoryID(subcatID: number): string {
    // debugger;
    let category: IFinancialCategory;

    [...this._categoriesService.allCategories].forEach(cat => {
      cat.subcats.forEach(subcat => {
        if (subcat.id === Number(subcatID)) { category = cat }
      });
    });

    return category!.icon;
  }

  getCategoryTitle(catID: number): string {
    let categoryTitle: string;
    [...this._categoriesService.allCategories].forEach(cat => { if (cat.id == catID) categoryTitle = cat.title });

    return categoryTitle!;
  }

   // metodos utilizados no render do modo listagem listagem
   getCatStyle(catID: number): string {
    let style: string;
    [...this._categoriesService.allCategories].forEach(cat => { if (cat.id == catID) { style = `background:${cat.bgcolor};color:${cat.textcolor};` } });

    return style!;
  }

  getSubcategoryTitle(catID: number, subcatID: number): string {
    let mainCat: IFinancialCategory;
    [...this._categoriesService.allCategories].forEach(cat => { if (cat.id == catID) mainCat = cat });

    let subCatTitle: string;
    [...mainCat!.subcats].forEach(subcat => { if (subcat.id == subcatID) subCatTitle = subcat.title });

    return subCatTitle!;
  }

  getSubcategoryTitleSimplex(subcatID: number): string {

    let subcategory : IFinancialSubCategory;
    [...this._categoriesService.allCategories].forEach(cat => {
      cat.subcats.forEach(subcat => {
        if (subcat.id === Number(subcatID)) { subcategory = subcat }
      });
    });

    return subcategory!.title!;
  }



  getCategoryIcon(catID: number): string {
    let icon: string;
    [...this._categoriesService.allCategories].forEach(cat => { if (cat.id == catID) icon = cat.icon });

    return icon!
  }
}
