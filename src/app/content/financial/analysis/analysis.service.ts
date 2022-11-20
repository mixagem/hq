import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { IFinancialCategory } from 'src/shared/interfaces/ifinancial-category';
import { IFinancialSubCategory } from 'src/shared/interfaces/ifinancial-sub-category';
import { MHQSnackBarsService } from 'src/shared/services/mhq-snackbar.service';

export type GraphTarget = 'cat' | 'subcat'
export type MVDGraph = { id: number, title: string, year: number, duration: number, acomul: boolean, target: GraphTarget, cat?: number[], subcat?: number[], inverted?: boolean[] }

@Injectable({ providedIn: 'root' })

export class AnalysisService {

  waitingForSQL = false;
  onInitTrigger: Subject<any>;

  catArray: IFinancialCategory[];
  subcatArray: IFinancialSubCategory[];

  graphConfig: MVDGraph; // config do gráfico
  selectedGraphID: number; // id do gráfico selecionado (selecionado = aceder ás opções do gráfico)

  constructor(private _snackbarService: MHQSnackBarsService, private _http: HttpClient, private _router: Router) {
    this.onInitTrigger = new Subject<any>(); // trigger para onInit do componente

    this.catArray = []
    this.subcatArray = []
  }

  onInitTriggerCall(): void { this.onInitTrigger.next(''); this.onInitTrigger.complete; this.onInitTrigger = new Subject<any>(); }

  // fetch da config do gráfico (api call)
  fetchGraphConfig(graphID: number): void {
    const HTTP_PARAMS = new HttpParams().set('graphid', graphID);

    const CALL = this._http.post('http://localhost:16190/fetchgraphconfig', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const ERR = codeReceived as string[];
        if (ERR[0] === 'MHQERROR') { return this._snackbarService.triggerMHQSnackbar(false, 'warning_amber', '', [ERR[1], '']) }
        const RESP = codeReceived as MVDGraph;
        this.graphConfig = RESP;
        this.waitingForSQL = false;
        this.onInitTriggerCall();
      },
      error: err => { return this._snackbarService.triggerMHQSnackbar(false, 'warning_amber', '', [err, '']) }
    });
  }

  // guardar a config do gráfico em bd (api call)
  saveGraphConfig(graphID: number, graph: MVDGraph): void {
    const CONFIG = JSON.stringify(graph)
    const HTTP_PARAMS = new HttpParams().set('graphid', graphID).set('config', CONFIG);

    const CALL = this._http.post('http://localhost:16190/savegraphconfig', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const ERR = codeReceived as string[];
        if (ERR[0] === 'MHQERROR') { return this._snackbarService.triggerMHQSnackbar(false, 'warning_amber', '', [ERR[1], '']) }
        this.onInitTriggerCall();
        this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigateByUrl('/fi/graphs', { skipLocationChange: true }) });

      },
      error: err => { return this._snackbarService.triggerMHQSnackbar(false, 'warning_amber', '', [err, '']) }
    });
  }


}
