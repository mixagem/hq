import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { FinancialService } from '../../financial.service';
import { map, startWith } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TreasuryService } from '../treasury.service';
import { IFinancialSubCategory } from 'src/assets/interfaces/ifinancial-sub-category';

@Component({
  selector: 'mhq-new-treasury-log',
  templateUrl: './new-treasury-log.component.html',
  styleUrls: ['../../../../../assets/styles/mhq-mainform-details.scss']
})
export class NewTreasuryLogComponent implements OnInit {

  tempTlog: ITreasuryLog;
  mypick: FormControl<any>;

// autocomplete categoria
  catForm = new FormControl('');
  catFormOptions: string[] = [];
  catFilteredOptions: Observable<string[]>;
  private _catfilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.catFormOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  // autocomplete sub categoria
  subCatForm = new FormControl('');
  subCatFormOptions: string[] = [];
  subCatFilteredOptions: Observable<string[]>;
  private _subcatfilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.subCatFormOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  constructor(public financialService: FinancialService, public treasuryService: TreasuryService, private _route: ActivatedRoute, public _router: Router, public _http: HttpClient) {

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
    const allCats = [...this.financialService.expenseCategories, ...this.financialService.incomeCategories]
    allCats.forEach(cat => {
      this.catFormOptions.push(cat.title)
    });
    allCats.forEach(cat => {
      cat.subcats.forEach(subcat => {
        this.subCatFormOptions.push(subcat.title)
      });
    });

    this.mypick = new FormControl(new Date(this.tempTlog.date));
  }

  toggleEditing(action: string): void {
    switch (action) {

      case 'save':

        // converter a data do picker para guardar da bd
        this.tempTlog.date = new Date(this.mypick.value.toISOString()).getTime();

        let subCats : IFinancialSubCategory[]; // subcats da categoria selecioanda

        // obter o ID da categoria selecionada
        const catID = [...this.financialService.allCategories].forEach(cat => {
          if (cat.title === this.catForm.value) {subCats = cat.subcats; return cat.id}
          return;
        });

        // obter o ID da sub-categoria selecionada
        const subCatID = subCats!.forEach(subcat => {
          subcat.title == this.subCatForm.value
        });

        // converter de títilo para o id das catgorias
        this.tempTlog.cat = catID!;
        this.tempTlog.subcat = subCatID!;

        this.saveTreasurylog();

        break;

      case 'end': default:
        document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')
        const timer = setTimeout(navi.bind(null, this._router), 1000) // tempo da animação antes de redirecionar
        function navi(router: Router): void {
          router.navigate(['/fi/tlogs'])
        }
    }
  }

  saveTreasurylog(): void {

    const httpParams = new HttpParams().set('tlog', JSON.stringify(this.tempTlog))
    const call = this._http.post('http://localhost:16190/addtlog', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this.treasuryService.fetchTreasuryLog('saveTreasuryLog', Number(codeReceived)); },
      error: err => this.financialService.handleError(err)
    })
  }

}