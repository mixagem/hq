import { Injectable } from '@angular/core';
import { CategoriesService } from 'src/app/content/financial/categories/categories.service';
import { IFinancialCategory } from '../interfaces/ifinancial-category';
import { IFinancialSubCategory } from '../interfaces/ifinancial-sub-category';

@Injectable({
  providedIn: 'root'
})
export class MiscService {

  constructor(private _categoriesService: CategoriesService) { }

  getCategoryIDFromSubcategoryID(subcatID: number): number {
    let category: IFinancialCategory;

    [...this._categoriesService.allCategories].forEach(cat => {
      cat.subcats.forEach(subcat => {
        if (subcat.id === subcatID) { category = cat }
      });
    });

    return category!.id;
  }

  getCategoryIconFromSubcategoryID(subcatID: number): string {
    let category: IFinancialCategory;

    [...this._categoriesService.allCategories].forEach(cat => {
      cat.subcats.forEach(subcat => {
        if (subcat.id === Number(subcatID)) { category = cat }
      });
    });

    return category!.icon;
  }

  getCategoryTitle(catID: number): string {
    const filteredCategoryTitle = [...this._categoriesService.allCategories].filter(cat => cat.id == catID)[0].title;
    return filteredCategoryTitle;
  }

  getCatStyle(catID: number): string {
    const filteredCategory = [...this._categoriesService.allCategories].filter(cat => cat.id == catID)[0];
    return `background:${filteredCategory.bgcolor};color:${filteredCategory.textcolor};`;
  }

  getSubcategoryTitle(catID: number, subcatID: number): string {
    const filteredCategory = [...this._categoriesService.allCategories].filter(cat => cat.id == catID)[0];
    const filteredSubcategoryTitle = [...filteredCategory.subcats].filter(subcat => subcat.id == subcatID)[0].title;
    return filteredSubcategoryTitle;
  }

  getSubcategoryTitleSimplex(subcatID: number): string {
    let subcategory: IFinancialSubCategory;

    [...this._categoriesService.allCategories].forEach(cat => {
      cat.subcats.forEach(subcat => {
        if (subcat.id === Number(subcatID)) { subcategory = subcat }
      });
    });

    return subcategory!.title;
  }

  getCategoryIcon(catID: number): string {
    const filteredCategoryIcon = [...this._categoriesService.allCategories].filter(cat => cat.id == catID)[0].icon;
    return filteredCategoryIcon;
  }

  getCategoryIDFromTitle(catTitle: string): number {
    const filteredCategoryID = [...this._categoriesService.allCategories].filter(cat => cat.title === catTitle)[0].id;
    return filteredCategoryID;
  }

  getCategoryObjectFromID(catID: number) : IFinancialCategory {
    const filteredCategory = [...this._categoriesService.allCategories].filter(cat => cat.id == catID)[0];
    return filteredCategory;
  }
}
