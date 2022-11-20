import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { IFinancialCategory } from 'src/shared/interfaces/ifinancial-category';
import { IFinancialSubCategory } from 'src/shared/interfaces/ifinancial-sub-category';
import { CategoriesService } from '../categories/categories.service';

type GraphTarget = 'cat' | 'subcat'
type GraphType = 'evo' | 'normal'


type MVDGraph = { id: number, title: string, year: number, duration: number, acomul: boolean, target: GraphTarget, cat?: number[], subcat?: number[], inverted?: boolean[] }

@Injectable({
  providedIn: 'root'
})


export class AnalysisService {

  selectedGraph: number;
  waitingForSQL = false;
  onInitTrigger: Subject<any>; // trigger para onInit
  graphConfig: MVDGraph;
  catArray: IFinancialCategory[];
  subcatArray: IFinancialSubCategory[];


  constructor(public categoriesService: CategoriesService, private _http: HttpClient, private _router: Router) {
    this.onInitTrigger = new Subject<any>(); // trigger para onInit do componente

    this.catArray = []
    this.subcatArray = []
  }


  onInitTriggerCall(): void { this.onInitTrigger.next(''); this.onInitTrigger.complete; this.onInitTrigger = new Subject<any>(); }


  fetchGraphConfig(graphID: number): any {
    const HTTP_PARAMS = new HttpParams().set('graphid', graphID);

    const CALL = this._http.post('http://localhost:16190/fetchgraphconfig', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const RESP = codeReceived as MVDGraph;
        this.graphConfig = RESP;
        this.waitingForSQL = false;
        this.onInitTriggerCall();
      },
      error: err => { }
    });
  }

  saveGraphConfig(graphID: number, graph: MVDGraph): any {
    const CONFIG = JSON.stringify(graph)
    const HTTP_PARAMS = new HttpParams().set('graphid', graphID).set('config', CONFIG);

    const CALL = this._http.post('http://localhost:16190/savegraphconfig', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        // return
        // const RESP = codeReceived as any;
        // this.graphConfig = RESP;
        this.onInitTriggerCall();
        this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigateByUrl('/fi/graphs', { skipLocationChange: true }) });

      },
      error: err => { }
    });
  }


}
