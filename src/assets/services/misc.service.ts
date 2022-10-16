import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { CategoriesService } from 'src/app/content/financial/categories/categories.service';
import { TreasuryService } from 'src/app/content/financial/treasury-log/treasury.service';
import { IFinancialCategory } from '../interfaces/ifinancial-category';
import { IFinancialSubCategory } from '../interfaces/ifinancial-sub-category';
import { ITreasuryLog } from '../interfaces/itreasury-log';

type CategoryStyles = {
  "background-color": string,
  "color": string
}

@Injectable({
  providedIn: 'root'
})

export class ErrorHandlingService {
  handleError(err: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) { errorMessage = `An error has ocurred: ${err.error.message}`; }
    else { errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`; }
    console.log(errorMessage);
    return throwError(() => errorMessage);
  }
}



@Injectable({
  providedIn: 'root'
})

export class TimerService {
  timer: any;
}


@Injectable({
  providedIn: 'root'
})

export class LoadingService {

  // variável com o estado da comunicação à bd
  categoriesLoadingComplete: Boolean;
  treasuryLoadingComplete: Boolean;

  constructor() {
    this.categoriesLoadingComplete = false;
    this.treasuryLoadingComplete = false;
  }

}


@Injectable({
  providedIn: 'root'
})
export class MiscService {

  constructor(private _categoriesService: CategoriesService, private _treasuryService: TreasuryService) { }

  // utilizado: categories.ts / category-details.html / treasury-log.ts
  getCategoryStyles(categoryID: number): CategoryStyles {

    let category = { "background-color": 'rgb(255,255,255)', "color": 'rgb(0,0,0)' }

    for (let i = 0; i < this._categoriesService.allCategories.length; i++) {
      if (this._categoriesService.allCategories[i].id === categoryID) {
        return category = { "background-color": this._categoriesService.allCategories[i].bgcolor, "color": this._categoriesService.allCategories[i].textcolor };
      }
    }

    return category;
  }

  // utilizado: category-details.ts
  getCategory(categoryID: number): IFinancialCategory {

    let category: IFinancialCategory = { id: 0, type: '', title: '', icon: '', bgcolor: '', textcolor: '', subcats: [], active: false, order: 0 };

    for (let i = 0; i < this._categoriesService.allCategories.length; i++) {
      if (this._categoriesService.allCategories[i].id === categoryID) {
        return category = this._categoriesService.allCategories[i];
      }
    }

    return category;
  }

  // utilizado: treasury-details.ts x2
  getCategoryFromTitle(catTitle: string): IFinancialCategory {

    let category: IFinancialCategory = { id: 0, type: '', title: '', icon: '', bgcolor: '', textcolor: '', subcats: [], active: false, order: 0 };

    for (let i = 0; i < this._categoriesService.allCategories.length; i++) {
      if (this._categoriesService.allCategories[i].title === catTitle) { return category = this._categoriesService.allCategories[i] }
    }

    return category;
  }

  // utilizado: treasury-details.ts
  getSubcategoryIDFromTitle(subcats: IFinancialSubCategory[], subcatTitle: string): number {

    let id = 0;
    for (let i = 0; i < subcats.length; i++) {
      if (subcats[i].title === subcatTitle) { return id = subcats[i].id }
    }
    return id
  }

  // utilizado: treasury-details.ts
  getTreasuryLog(tlogID: number): ITreasuryLog {

    let tlog: ITreasuryLog = { id: 0, title: '', date: 0, value: 0, cat: 0, subcat: 0, type: '', obs: '', recurrencyid: 0 };

    for (let i = 0; i < this._treasuryService.treasuryLog.length; i++) {
      if (this._treasuryService.treasuryLog[i].id === tlogID) {
        return tlog = this._treasuryService.treasuryLog[i]
      }
    }

    return tlog;

  }


  // novos -^     v- velhos


  // utilizado: overview.component
  getCategoryIDFromSubcategoryID(subcatID: number): number {
    let category: IFinancialCategory;

    [...this._categoriesService.allCategories].forEach(cat => {
      cat.subcats.forEach(subcat => {
        if (subcat.id === subcatID) { category = cat }
      });
    });

    return category!.id;
  }

  // utilizado: overview-daily-details-modal.html
  getCategoryIconFromSubcategoryID(subcatID: number): string {
    let category: IFinancialCategory;

    [...this._categoriesService.allCategories].forEach(cat => {
      cat.subcats.forEach(subcat => {
        if (subcat.id === Number(subcatID)) { category = cat }
      });
    });

    return category!.icon;
  }



  // utilizado: overview.component  / new-treasury-log.component / treasury-details.html / treasury-details.component
  getCategoryTitle(catID: number): string {
    const filteredCategoryTitle = [...this._categoriesService.allCategories].filter(cat => cat.id == catID)[0].title;
    return filteredCategoryTitle;
  }


  // utilizado: overview-daily-details-modal.component / overview-daily-details-modal.html / treasury-log.html / new-treasury-log.html / treasury-details.html
  getCatStyle(catID: number): string {
    const filteredCategory = [...this._categoriesService.allCategories].filter(cat => cat.id == catID)[0];
    return `background:${filteredCategory.bgcolor};color:${filteredCategory.textcolor};`;
  }

  // utilizao: overview-daily-details-modal.component
  getCatStyleSimplex(catID: number): string[] {
    const filteredCategory = [...this._categoriesService.allCategories].filter(cat => cat.id == catID)[0];
    return [filteredCategory.bgcolor, filteredCategory.textcolor]
  }

  // utilizado:  overview.component  / overview-daily-details-modal.html / treasury-log.html / new-treasury-log.component / treasury-details.html / treasury-details.component
  getSubcategoryTitle(catID: number, subcatID: number): string {
    const filteredCategory = [...this._categoriesService.allCategories].filter(cat => cat.id == catID)[0];
    const filteredSubcategoryTitle = [...filteredCategory.subcats].filter(subcat => subcat.id == subcatID)[0].title;
    return filteredSubcategoryTitle;
  }

  // utilizado:  overview-daily-details-modal.html
  getSubcategoryTitleSimplex(subcatID: number): string {
    let subcategory: IFinancialSubCategory;

    [...this._categoriesService.allCategories].forEach(cat => {
      cat.subcats.forEach(subcat => {
        if (subcat.id === Number(subcatID)) { subcategory = subcat }
      });
    });

    return subcategory!.title;
  }
  // utilizado:  overview-daily-details-modal.html  / treasury-log.html  / new-treasury-log.html  / treasury-details.html
  getCategoryIcon(catID: number): string {
    const filteredCategoryIcon = [...this._categoriesService.allCategories].filter(cat => cat.id == catID)[0].icon;
    return filteredCategoryIcon;
  }

  // utilizado:  treasury-details.component   / new-treasury-log.component  / new-treasury-log.html  / treasury-details.html
  getCategoryIDFromTitle(catTitle: string): number {
    const filteredCategoryID = [...this._categoriesService.allCategories].filter(cat => cat.title === catTitle)[0].id;
    return filteredCategoryID;
  }
  // utilizado:  treasury-details.component   / new-treasury-log.component
  getCategoryObjectFromID(catID: number): IFinancialCategory {
    const filteredCategory = [...this._categoriesService.allCategories].filter(cat => cat.id == catID)[0];
    return filteredCategory;
  }



}


