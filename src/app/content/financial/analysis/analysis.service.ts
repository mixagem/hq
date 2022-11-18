import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IFinancialSubCategory } from 'src/shared/interfaces/ifinancial-sub-category';
import { CategoriesService } from '../categories/categories.service';

@Injectable({
  providedIn: 'root'
})


export class AnalysisService {

  waitingForSQL = false;

  onInitTrigger: Subject<any>; // trigger para onInit

  graphConfig: any;

  catArray: any[];
  subcategoriesList: any[];


  constructor(public categoriesService: CategoriesService, private _http: HttpClient) {

    this.onInitTrigger = new Subject<any>(); // trigger para onInit do componente

    this.catArray = []

    this.subcategoriesList = []


    for (let i = 0; i < Object.keys(this.categoriesService.catTable).length; i++) { this.catArray.push(this.categoriesService.catTable[Object.keys(this.categoriesService.catTable)[i]]) }



  }
  onInitTriggerCall(): void { this.onInitTrigger.next(''); this.onInitTrigger.complete; this.onInitTrigger = new Subject<any>(); }


  fetchGraphConfig(type: string): any {
    const HTTP_PARAMS = new HttpParams().set('type', type);

    const CALL = this._http.post('http://localhost:16190/fetchgraphconfig', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const RESP = codeReceived as any;
        this.graphConfig = RESP;
        this.waitingForSQL = false;
        this.onInitTriggerCall();
      },
      error: err => { }
    });
  }

  refreshSubcategoryList(catID: number): void {

    this.subcategoriesList = [];
    this.categoriesService.catTable[`'${catID}'`].subcats.forEach((subcat: IFinancialSubCategory) => { this.subcategoriesList.push({ title: subcat.title, value: subcat.id }) });
  }


}
