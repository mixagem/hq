import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ScaleType } from '@swimlane/ngx-charts';
import { LoadingService } from 'src/assets/services/misc.service';
import { CategoriesService } from '../categories/categories.service';
import { TreasuryService } from '../treasury-log/treasury.service';


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
  styleUrls: ['./analysis.component.scss', '../../../../assets/styles/mhq-mainform.scss']
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

  constructor(private _http: HttpClient, private _categoriesService: CategoriesService, public loadingService: LoadingService) {
    // Object.assign(this, this.graphs[0]);
    //loading check

  }

  ngOnInit(): void {
    this._categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this.loadingService.categoriesLoadingComplete) { return }

    this.getYearlySavingSnapshotsForGraphs();
    this.getSnapshotForGraphs('cat', 2023, [1, 2], 2);
    this.getSnapshotForGraphs('cat', 2023, [3, 4], 3);
    this.getSnapshotForGraphs('subcat', 2023, [7, 8, 9, 10], 4);
  }

  getSnapshotForGraphs(type: string, year: number, catids: number[], graph: number): void {
    // ano, categorias, subcategorias
    const CAT_TITLES: string[] = [];
    if (type === 'cat') { catids.forEach(catID => { CAT_TITLES.push(this._categoriesService.catEnum[catID].title) }); }
    if (type === 'subcat') { catids.forEach(subcatID => { CAT_TITLES.push(this._categoriesService.subcatEnum[subcatID].title) }); }

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


  getYearlySavingSnapshotsForGraphs(): void {
    const HTTP_PARAMS = new HttpParams().set('year', 2023)
    const CALL = this._http.post('http://localhost:16190/savingsgraphsnapshot', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const RESP = codeReceived as SavingsSnapshot[];
        this.graphs[0] = new Array(2);
        this.graphs[0][0] = RESP[0]
        this.graphs[0][1] = RESP[1];
      },
      error: err => { }
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