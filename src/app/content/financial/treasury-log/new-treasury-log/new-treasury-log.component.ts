import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { CategoriesService } from '../../categories/categories.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TreasuryService } from '../treasury.service';
import { IFinancialSubCategory } from 'src/assets/interfaces/ifinancial-sub-category';
import { MatDatepicker } from '@angular/material/datepicker';
import { MiscService, TimerService } from 'src/assets/services/misc.service';
import { MatSelectChange } from '@angular/material/select';

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

  tempTreasuryLog: ITreasuryLog;

  // autocomplete categoria
  catForm: FormControl
  categoriesList: string[] = [];


  // autocomplete sub categoria
  subcatForm: FormControl
  subcategoriesList: string[] = [];


  constructor(public miscService: MiscService, public categoriesService: CategoriesService, public treasuryService: TreasuryService, private _route: ActivatedRoute, public _router: Router, public _http: HttpClient, private _timerService:TimerService) { }

  ngOnInit(): void {

    // clone inicial
    if (this.treasuryService.cloningTreasuryLog) {
      this.tempTreasuryLog = this.treasuryService.activeTreasuryLog;
      this.tempTreasuryLog.id = 0;
    } else {
      this.tempTreasuryLog = JSON.parse(JSON.stringify(DEFAULT_TLOG));
    }

    // datepicker
    this.treasuryLogDatepickerForm = new FormControl(new Date(this.tempTreasuryLog.date), [Validators.required]);

    // forms para inputs autocomplete
    if (this.treasuryService.cloningTreasuryLog) {
      this.catForm = new FormControl(this.miscService.getCategoryTitle(this.tempTreasuryLog.cat), [Validators.required]);
      this.subcatForm = new FormControl({ value: this.miscService.getSubcategoryTitle(this.tempTreasuryLog.cat, this.tempTreasuryLog.subcat), disabled: true }, [Validators.required]);

      this.miscService.getCategoryObjectFromID(this.tempTreasuryLog.cat).subcats.forEach(subcat => {
        this.subcategoriesList.push(subcat.title)
      });
      this.subcatForm.enable();
    } else {
      this.catForm = new FormControl('', [Validators.required]);
      this.subcatForm = new FormControl({ value: '', disabled: true }, [Validators.required]);



    }

    // opções para select
    this.categoriesService.allCategories.forEach(cat => {
      this.categoriesList.push(cat.title)
    });



  }

  newTreasuryLogRecordActions(action: string): void {
    switch (action) {

      case 'save':
        if (this.catForm.errors || this.subcatForm.errors || this.subcatForm.value === '' || this.subcatForm.disabled) { return alert('fuck you') }

        // converter a data do picker para guardar da bd
        this.tempTreasuryLog.date = this.treasuryLogDatepickerForm.value.getTime();

        let catID: number; // id da categoria
        let catBGColor: string; // cor da categoria
        let subCats: IFinancialSubCategory[]; // subcats da categoria selecioanda

        // obter o ID, BGColor e SubCategorias  da categoria selecionada
        const cat = [...this.categoriesService.allCategories].filter(cat => cat.title === this.catForm.value)[0];
        catBGColor = cat.bgcolor;
        subCats = cat.subcats;
        catID = cat.id

        // obter o ID da sub-categoria selecionada
        const subCatID: number = subCats!.filter(subcat => subcat.title === this.subcatForm.value)[0].id;


        this.tempTreasuryLog.value = Number(this.tempTreasuryLog.value.toString().replace(',','.')) // conversão de vírgulas para pontos
        // converter de títilo para o id das catgorias
        this.tempTreasuryLog.cat = catID!;
        this.tempTreasuryLog.subcat = subCatID!;

        this.treasuryService.recordBorderStyle['background-color'] = catBGColor!;
        this.saveTreasurylog();

        break;

      case 'end': default:
        document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight');
        // clearTimeout(this._timerService.timer);
        this._timerService.timer = setTimeout(navi.bind(null, this._router), 1000) // tempo da animação antes de redirecionar
        function navi(router: Router): void {
          router.navigate(['/fi/tlogs'])
        }
    }
  }

  saveTreasurylog(): void {

    const httpParams = new HttpParams().set('tlog', JSON.stringify(this.tempTreasuryLog));
    const call = this._http.post('http://localhost:16190/createtreasurylog', httpParams, { responseType: 'text' });

    call.subscribe({
      next: codeReceived => { this.treasuryService.fetchTreasuryLog('saveTreasuryLog', Number(codeReceived)); },
      error: err => this.categoriesService.handleError(err)
    })
  }

  categorySelectChanged(event: MatSelectChange): void {
    const categoryID = this.miscService.getCategoryIDFromTitle(event.value);
    const category = this.categoriesService.allCategories.filter(cat => cat.id === categoryID)[0];

    this.subcategoriesList = [];
    category.subcats.forEach(subcat => {
      this.subcategoriesList.push(subcat.title)
    });

    this.subcatForm.setValue('')
    this.subcategoriesList.length > 0 ? this.subcatForm.enable() : this.subcatForm.disable();
  }


}
