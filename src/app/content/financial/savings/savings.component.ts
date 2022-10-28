import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { ScaleType } from '@swimlane/ngx-charts';
import { CategoriesService } from '../categories/categories.service';


export type SavingsSnapshot = {
  name: string,
  series: {
    name: string,
    value: number
  }[]
}


@Component({
  selector: 'mhq-savings',
  templateUrl: './savings.component.html',
  styleUrls: ['./savings.component.scss', '../../../../assets/styles/mhq-mainform.scss']
})


export class SavingsComponent {
  multi: SavingsSnapshot[] = [];
  multi2: SavingsSnapshot[] = [];

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

  constructor(private _http: HttpClient, private _categoriesService: CategoriesService) {
    Object.assign(this, this.multi);
    this.getYearlySavingSnapshotsForGraphs();
    this.getSnapshotForGraphs(2023, [1, 2]);
  }

  getSnapshotForGraphs(year: number, categories: number[]): void {
    // ano, categorias, subcategorias
    const CAT_TITLES: string[] = [];
    categories.forEach(catID => { CAT_TITLES.push(this._categoriesService.catEnum[catID].title) });


    const HTTP_PARAMS = new HttpParams().set('year', year).set('cats', JSON.stringify(categories)).set('titles', JSON.stringify(CAT_TITLES));
    const CALL = this._http.post('http://localhost:16190/testesnapshot', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const RESP = codeReceived as SavingsSnapshot[];
        this.multi2 = new Array(2);
        this.multi2[0] = RESP[0]
        this.multi2[1] = RESP[1];
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
        this.multi = new Array(2);
        this.multi[0] = RESP[0]
        this.multi[1] = RESP[1];
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