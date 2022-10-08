import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { CategoriesService } from '../../categories/categories.service';
import { map, startWith } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TreasuryService } from '../treasury.service';
import { IFinancialSubCategory } from 'src/assets/interfaces/ifinancial-sub-category';
import { MatDatepicker } from '@angular/material/datepicker';

const DEFAULT_TLOG: ITreasuryLog = {
  id: 0, //ignrado ao ser enviado para bd
  title: 'Novo movimento de tesouraria',
  date: Date.now(), // a ser definido pelo utilizador
  value: 0,
  cat: 0, // a ser definido pelo utilizador
  subcat: 0, // a ser definido pelo utilizador
  type: 'expense',
  obs: ''
}

@Component({
  selector: 'mhq-new-treasury-log',
  templateUrl: './new-treasury-log.component.html',
  styleUrls: ['../../../../../assets/styles/mhq-mainform-details.scss']
})
export class NewTreasuryLogComponent implements OnInit {

  // datepicker
  treasuryLogDatepicker: MatDatepicker<any>;
  treasuryLogDatepickerForm: FormControl<any>;

  tempTlog: ITreasuryLog;

  // autocomplete categoria
  catForm: FormControl
  catFormOptions: string[] = [];
  catFilteredOptions: Observable<string[]>;
  private _catfilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.catFormOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  // autocomplete sub categoria
  subCatForm: FormControl
  subCatFormOptions: string[] = [];
  subCatFilteredOptions: Observable<string[]>;
  private _subcatfilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.subCatFormOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  constructor(public categoriesService: CategoriesService, public treasuryService: TreasuryService, private _route: ActivatedRoute, public _router: Router, public _http: HttpClient) { }

  ngOnInit(): void {

    if (this.treasuryService.cloningTLog) {
      this.tempTlog = this.treasuryService.activeTreasuryLog
      this.tempTlog.id = 0
    } else {
      this.tempTlog = DEFAULT_TLOG
    }

    if (this.treasuryService.cloningTLog) {
      this.catForm = new FormControl(this.treasuryService.getCatLabel(this.tempTlog.cat), [Validators.required]);
      this.subCatForm = new FormControl(this.treasuryService.getSubCatLabel(this.tempTlog.cat, this.tempTlog.subcat), [Validators.required]);
    } else {
      this.catForm = new FormControl('', [Validators.required]);
      this.subCatForm = new FormControl('', [Validators.required]);
    }

    this.treasuryLogDatepickerForm = new FormControl(new Date(this.tempTlog.date), [Validators.required]);


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
    const allCats = [...this.categoriesService.allCategories]
    allCats.forEach(cat => {
      this.catFormOptions.push(cat.title)
    });
    allCats.forEach(cat => {
      cat.subcats.forEach(subcat => {
        this.subCatFormOptions.push(subcat.title)
      });
    });


  }

  newTreasuryLogRecordActions(action: string): void {
    switch (action) {

      case 'save':

        if (this.catForm.errors || this.subCatForm.errors) { return alert('fuck you') }

        // converter a data do picker para guardar da bd
        this.tempTlog.date = this.treasuryLogDatepickerForm.value.getTime();

        let catID: number; // id da categoria
        let catBGColor: string // cor da categoria
        let subCats: IFinancialSubCategory[]; // subcats da categoria selecioanda

        // obter o ID, BGColor e SubCategorias  da categoria selecionada
        [...this.categoriesService.allCategories].forEach(cat => {
          if (cat.title === this.catForm.value) { catBGColor = cat.bgcolor; subCats = cat.subcats; catID = cat.id; return; }
        });

        // obter o ID da sub-categoria selecionada
        let subCatID: number;
        subCats!.forEach(subcat => {
          if (subcat.title === this.subCatForm.value) { subCatID = subcat.id; return; }
        });

        // converter de títilo para o id das catgorias
        this.tempTlog.cat = catID!;
        this.tempTlog.subcat = subCatID!;

        this.treasuryService.recordBorderStyle['background-color'] = catBGColor!;
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
    const call = this._http.post('http://localhost:16190/createtreasurylog', httpParams, { responseType: 'text' })

    call.subscribe({
      next: codeReceived => { this.treasuryService.fetchTreasuryLog('saveTreasuryLog', Number(codeReceived)); },
      error: err => this.categoriesService.handleError(err)
    })
  }

}
