import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ScaleType } from '@swimlane/ngx-charts';
import { LoadingService } from 'src/shared/services/misc.service';
import { CategoriesService } from '../categories/categories.service';
import { AnalysisService } from './analysis.service';
import { GraphConfigModalComponent } from './graph-config-modal/graph-config-modal.component';

export type GraphRender = { name: string, series: { name: string, value: number }[] }


@Component({
  selector: 'mhq-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss', '../../../../shared/styles/mhq-mainform.scss']
})


export class AnalysisComponent implements OnInit {
  graphs: GraphRender[][] = [];

  waikiki = {
    name: 'waikiki',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      'var(--mhq-waikiki-pcolor-1)',
      'var(--mhq-waikiki-acolor-1)',
      'var(--mhq-waikiki-sucess)',
      'var(--mhq-waikiki-danger)'
    ]
  }

  constructor(private _http: HttpClient, private _categoriesService: CategoriesService, public loadingService: LoadingService, private _matDialog: MatDialog, private _analysisService: AnalysisService) {

  }

  ngOnInit(): void {
    this._categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this.loadingService.categoriesLoadingComplete) { return }

    for (let i = 1; i <= 3; i++) { this.getGraph(i) }

  }


  getGraph(graphID: number): void {

    const HTTP_PARAMS = new HttpParams().set('graphid', graphID)
    const CALL = this._http.post('http://localhost:16190/getgraph', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const RESP = codeReceived as GraphRender[];
        const GRAPH_LENGTH = RESP.length;
        this.graphs[graphID - 1] = new Array(GRAPH_LENGTH);
        RESP.forEach((graph, i) => {
          this.graphs[graphID - 1][i] = graph
        });
      },
      error: err => { }
    });
  }

  openGraphConfig(enterAnimationDuration: string, exitAnimationDuration: string, graphID: number): void {
    this._analysisService.catArray = []; this._analysisService.subcatArray = [];
    for (let i = 0; i < Object.keys(this._categoriesService.catTable).length; i++) { this._analysisService.catArray.push(this._categoriesService.catTable[Object.keys(this._categoriesService.catTable)[i]]) }
    for (let i = 0; i < Object.keys(this._categoriesService.subcatTable).length; i++) { this._analysisService.subcatArray.push(this._categoriesService.subcatTable[Object.keys(this._categoriesService.subcatTable)[i]]) }
    this._analysisService.selectedGraph = graphID;
    this._matDialog.open(GraphConfigModalComponent, {
      width: '800px',
      height: '600px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
}