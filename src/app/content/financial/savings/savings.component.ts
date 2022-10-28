import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { ScaleType } from '@swimlane/ngx-charts';


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

  waikiki =  {
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

  constructor(private _http: HttpClient) {
    Object.assign(this, this.multi);
    this.getYearlySnapshotForGraphs();
  }


  getYearlySnapshotForGraphs(): void {
    const HTTP_PARAMS = new HttpParams().set('year', 2023)
    const CALL = this._http.post('http://localhost:16190/savingsgraphsnapshot', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const RESP = codeReceived as SavingsSnapshot[];
        this.multi = new Array(2);
        this.multi[0] = RESP[0]
        this.multi[1] = RESP[1];
        // console.log(this.multi)
        // console.log(RESP)
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