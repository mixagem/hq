import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ScaleType } from '@swimlane/ngx-charts';
import { MHQSnackBarsService } from 'src/shared/services/mhq-snackbar.service';
import { LoadingService } from 'src/shared/services/misc.service';
import { CategoriesService } from '../categories/categories.service';
import { AnalysisService } from './analysis.service';
import { GraphConfigModalComponent } from './graph-config-modal/graph-config-modal.component';

export type GraphData = { name: string, series: { name: string, value: number }[] }
export type GraphSchema = { name: string, selectable: boolean, group: ScaleType, domain: string[] }

@Component({
  selector: 'mhq-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss', '../../../../shared/styles/mhq-mainform.scss']
})

export class AnalysisComponent implements OnInit {
  graphs: GraphData[][]; // array com todos os gráficos
  graphsTitles: string[];
  waikiki: GraphSchema; // configuração componente gráficos

  constructor(public loadingService: LoadingService, private _http: HttpClient, private _categoriesService: CategoriesService, private _matDialog: MatDialog, private _analysisService: AnalysisService, private _snackbarService: MHQSnackBarsService) { }

  ngOnInit(): void {
    this._categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this.loadingService.categoriesLoadingComplete) { return }

    this.graphs = [];
    this.graphsTitles = new Array(7).fill('');
    this.waikiki = {
      name: 'waikiki',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: ['var(--mhq-waikiki-pcolor-1)', 'var(--mhq-waikiki-acolor-1)', 'var(--mhq-waikiki-sucess)', 'var(--mhq-waikiki-danger)', 'var(--mhq-waikiki-acolor-4)']
    }

    for (let i = 1; i <= 3; i++) { this.getGraph(i) }
  }

  // fetch do gráfico (api call)
  getGraph(graphID: number): void {
    const HTTP_PARAMS = new HttpParams().set('graphid', graphID)
    const CALL = this._http.post('http://localhost:16190/getgraph', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const ERR = codeReceived as string[];
        if (ERR[0] === 'MHQERROR') { return this._snackbarService.triggerMHQSnackbar(false, 'warning_amber', '', [ERR[1], '']) }
        const RESP = codeReceived as any[];
        this.graphs[graphID - 1] = new Array(RESP.length - 1);
        RESP.forEach((graph, i) => {
          if (i === 0) { this.graphsTitles[graphID - 1] = graph }
          else { this.graphs[graphID - 1][i-1] = graph }
        });
      },
      error: err => { return this._snackbarService.triggerMHQSnackbar(false, 'warning_amber', '', [err, '']) }
    });
  }

  openGraphConfig(enterAnimationDuration: string, exitAnimationDuration: string, graphID: number): void {
    //atualizar a lista de cat/subcategorias
    this._analysisService.catArray = []; this._analysisService.subcatArray = [];
    for (let i = 0; i < Object.keys(this._categoriesService.catTable).length; i++) { this._analysisService.catArray.push(this._categoriesService.catTable[Object.keys(this._categoriesService.catTable)[i]]) }
    for (let i = 0; i < Object.keys(this._categoriesService.subcatTable).length; i++) { this._analysisService.subcatArray.push(this._categoriesService.subcatTable[Object.keys(this._categoriesService.subcatTable)[i]]) }

    this._analysisService.selectedGraphID = graphID; // atualizar gráfico selecionado
    this._matDialog.open(GraphConfigModalComponent, { width: '800px', height: '600px', enterAnimationDuration, exitAnimationDuration, }); // abrir modal
  }

  // funções para o gráfico
  onSelect(data: any): void { console.log('Item clicked', JSON.parse(JSON.stringify(data))); }
  onActivate(data: any): void { console.log('Activate', JSON.parse(JSON.stringify(data))); }
  onDeactivate(data: any): void { console.log('Deactivate', JSON.parse(JSON.stringify(data))); }
}