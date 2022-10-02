import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { FinancialService } from '../../financial.service';
import { map, startWith } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'mhq-new-treasury-log',
  templateUrl: './new-treasury-log.component.html',
  styleUrls: ['./new-treasury-log.component.scss']
})
export class NewTreasuryLogComponent implements OnInit {

  tempTlog: ITreasuryLog;
  mypick: FormControl<any>;

  catForm = new FormControl('');
  catFormOptions: string[] = [];
  catFilteredOptions: Observable<string[]>;

  subCatForm = new FormControl('');
  subCatFormOptions: string[] = [];
  subCatFilteredOptions: Observable<string[]>;


  constructor(private _financialService: FinancialService, private _route: ActivatedRoute, public _router: Router,public _http: HttpClient) {

    this.tempTlog = {
      id: 0,
      title: 'temp',
      date: Date.now(),
      value: 0,
      cat: 0,
      subcat: 0,
      type: 'expense',
      obs: ''
    }
  }

  private _catfilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.catFormOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  private _subcatfilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.subCatFormOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  ngOnInit(): void {

    // auto complete
    this.catFilteredOptions = this.catForm.valueChanges.pipe(
      startWith(''),
      map(value => this._catfilter(value || '')),
    );

    // auto complete
    this.subCatFilteredOptions = this.subCatForm.valueChanges.pipe(
      startWith(''),
      map(value => this._subcatfilter(value || '')),
    );

    this.catFormOptions = [];
    this.subCatFormOptions = [];
    const allCats = [...this._financialService.expenseCategories, ...this._financialService.incomeCategories]
    const fetchCatLabels = allCats.forEach(cat => {
      this.catFormOptions.push(cat.title)
    });
    const fetchSubCatLabels = allCats.forEach(cat => {
      cat.subcats.forEach(subcat => {
        this.subCatFormOptions.push(subcat.title)
      });
    });

    this.mypick = new FormControl(new Date(this.tempTlog.date));
  }

  toggleEditing(action: string): void {
    switch (action) {

      case 'save':

        this.tempTlog.date = new Date(this.mypick.value.toISOString()).getTime();

        const catID = [...this._financialService.incomeCategories, ...this._financialService.expenseCategories].filter(cat => cat.title === this.catForm.value)[0].id

        const subcatstofilter = [...this._financialService.incomeCategories, ...this._financialService.expenseCategories].filter(cat => cat.id == catID)[0].subcats;

        const subCatID = subcatstofilter.filter(subcat => subcat.title === this.subCatForm.value)[0].id

        this.tempTlog.cat = catID;
        this.tempTlog.subcat = subCatID;

        this.saveTlog();

        break;

      case 'end': default:
        document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')
        const timer = setTimeout(navi.bind(null, this._router), 1000) // tempo da animação antes de redirecionar
        function navi(router: Router): void {
          router.navigate(['/fi/tlogs'])
        }
    }
  }

  saveTlog(): void {

    const httpParams = new HttpParams().set('tlog', JSON.stringify(this.tempTlog))
    const call = this._http.post('http://localhost:16190/addtlog', httpParams, { responseType: 'text' })

    call.subscribe({
      //TODO fazer addtlog no

      next: codeReceived => {this.fetchTlog(Number(codeReceived)); },
      error: err => this._financialService.handleError(err)
    })
  }

  fetchTlog(tlogNewID: number) {
    const call = this._http.get('http://localhost:16190/gettlogs')
    call.subscribe({
      next: (codeReceived) => {
        const resp = codeReceived as ITreasuryLog[];
        this._financialService.treasuryLog = resp;
        const timer = setTimeout(navi.bind(null, this._router), 1000) // tempo da animação antes de redirecionar
        function navi(router: Router): void {
          //marteladinha para fechar a modal
          // const ele = document.querySelector('.cdk-overlay-backdrop') as HTMLElement;
          // ele.click();
          router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            router.navigate(['/fi/tlogs',tlogNewID]);
          });
        }
      }, error: err => this._financialService.handleError(err)
    })
  }

}
