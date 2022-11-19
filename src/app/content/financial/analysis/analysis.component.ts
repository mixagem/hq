import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ScaleType } from '@swimlane/ngx-charts';
import { LoadingService } from 'src/shared/services/misc.service';
import { CategoriesService } from '../categories/categories.service';
import { AnalysisEvolutionConfigModalComponent } from './analysis-evolution-config-modal/analysis-evolution-config-modal.component';
import { AnalysisHeadtoHeadConfigModalComponent } from './analysis-headto-head-config-modal/analysis-headto-head-config-modal.component';

type GraphType = 'evo' | 'h2h'
export type SavingsSnapshot = {
  name: string,
  series: {
    name: string,
    value: number
  }[]
}


@Component({
  selector: 'mhq-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss', '../../../../shared/styles/mhq-mainform.scss']
})


export class AnalysisComponent implements OnInit {
  graphs: SavingsSnapshot[][] = [[]];

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

  constructor(private _http: HttpClient, private _categoriesService: CategoriesService, public loadingService: LoadingService, private _matDialog: MatDialog) {

  }

  ngOnInit(): void {
    this._categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this.loadingService.categoriesLoadingComplete) { return }

    this.getGraph('evo', 0, true);
    this.getGraph('h2h', 1);
    this.getGraph('stack', 2, true);
  }

  getSnapshotForGraphs(type: string, year: number, catids: number[], graph: number): void {
    const CAT_TITLES: string[] = [];
    if (type === 'cat') { catids.forEach(catID => { CAT_TITLES.push(this._categoriesService.catTable[`'${catID}'`].title) }); }
    if (type === 'subcat') { catids.forEach(subcatID => { CAT_TITLES.push(this._categoriesService.subcatTable[subcatID].title) }); }

    const HTTP_PARAMS = new HttpParams().set('year', year).set('type', type).set('cats', JSON.stringify(catids)).set('titles', JSON.stringify(CAT_TITLES));
    const CALL = this._http.post('http://localhost:16190/testesnapshot', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const RESP = codeReceived as SavingsSnapshot[];
        this.graphs[graph - 1] = new Array(RESP.length);

        RESP.forEach((resp, i) => {
          this.graphs[graph - 1][i] = resp
        });

      },
      error: err => { }
    });
  }

  getGraph(type: string, graphSlot: number, inverted: boolean = false): void {

    let HTTP_PARAMS;

    if (!inverted) { HTTP_PARAMS = new HttpParams().set('type', type) }
    if (inverted) { HTTP_PARAMS = new HttpParams().set('type', type).set('inverted', true) }

    const CALL = this._http.post('http://localhost:16190/getgraph', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const RESP = codeReceived as SavingsSnapshot[];
        const GRAPH_LENGTH = RESP.length;
        this.graphs[graphSlot] = new Array(GRAPH_LENGTH);
        RESP.forEach((graph, i) => {
          this.graphs[graphSlot][i] = graph
        });
      },
      error: err => { }
    });
  }

  openAnalysisConfigModal(enterAnimationDuration: string, exitAnimationDuration: string, graphType: GraphType): void {

    let modalToOpen: any;
    switch (graphType) {
      case 'evo':
        modalToOpen = AnalysisEvolutionConfigModalComponent
        break;
      case 'h2h':
        modalToOpen = AnalysisHeadtoHeadConfigModalComponent
        break;
    }
    this._matDialog.open(modalToOpen, {
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