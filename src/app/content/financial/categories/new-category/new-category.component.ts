import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IFinancialCategory } from 'src/shared/interfaces/ifinancial-category';
import { CategoriesService } from '../categories.service';
import { Router } from '@angular/router';
import { IFinancialSubCategory } from 'src/shared/interfaces/ifinancial-sub-category';
import { ErrorHandlingService, LoadingService, TimerService } from 'src/shared/services/misc.service';
import { MHQSnackBarsService } from '../../../../../shared/services/mhq-snackbar.service';
import { Subject } from 'rxjs';

type RecordActions = 'save' | 'cancel'


const DEFAULT_FICATEGORY: IFinancialCategory = { id: 0, type: 'expense', title: 'Nova categoria', icon: 'dns', bgcolor: 'rgb(0,0,0)', textcolor: 'rgb(255,255,255)', subcats: [], active: false, order: 0 };
const DEFAULT_FISUBCATEGORY: IFinancialSubCategory = { id: Date.now(), maincatid: 0, title: 'Nova sub-categoria', budget: 0, active: false, order: 0 };

@Component({
  selector: 'mhq-new-category',
  templateUrl: './new-category.component.html',
  styleUrls: ['../../../../../shared/styles/mhq-mainform-details.scss']
})

export class NewCategoryComponent implements OnInit {
  firstLoadingComplete: boolean;

  tempCat: IFinancialCategory;

  constructor(public categoriesService: CategoriesService, private _http: HttpClient, private _router: Router, private _timerService: TimerService, private _mhqSnackbarService: MHQSnackBarsService, private _errorHandlingService: ErrorHandlingService, public loadingService: LoadingService) {
    this.firstLoadingComplete = false;
  }

  ngOnInit(): void {
    this.categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this.loadingService.categoriesLoadingComplete || this.firstLoadingComplete) { return }
    this.firstLoadingComplete = true;  // loading check
    this.categoriesService.onInitTrigger.complete; this.categoriesService.onInitTrigger = new Subject<any>();
    // cria a categoria temporária de acordo com o tipo de introdução
    if (this.categoriesService.cloningCat) {
      this.tempCat = { ...this.categoriesService.activeCat }; // caso seja duplicação de um registo
      this.tempCat.id = 0; // é preciso resetar o id (apenas influência visualmente, na chamada à bd eu ignoro este campo)
    } else {
      this.tempCat = JSON.parse(JSON.stringify(DEFAULT_FICATEGORY)); // o rest operator não tava a bombar fixe aqui
    }

    this.categoriesService.recordBorderStyle['background-color'] = this.tempCat.bgcolor;
  }

  // ações de registo
  catRecordActions(action: RecordActions): void {
    switch (action) {
      case 'save':
        if (this.categoriesService.headerInputsValidation(this.tempCat)) { this.createCat(); }
        break;

      case 'cancel': default:
        document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight');
        this._timerService.timer = setTimeout(() => { this._router.navigate(['/fi/cats']); }, 750);
    }
  }

  // concluí o modo de introdução (manda para bd, faz fresh à listagem e à gaveta)
  createCat(): void {
    const HTTP_PARAMS = new HttpParams().set('category', JSON.stringify(this.tempCat));
    const CALL = this._http.post('http://localhost/hq/php/cats/newcat.php', HTTP_PARAMS, { responseType: 'json' });
    // const CALL = this._http.post('http://localhost:16190/createnewcategory', HTTP_PARAMS, { responseType: 'json' });
    CALL.subscribe({
      next: codeReceived => {
        const RESP = codeReceived as string[];

        if (RESP[0] !== 'MHQERROR') {
          this.categoriesService.fetchCategories('saveCat', Number(RESP[0]));
          this.categoriesService.recordBorderStyle['background-color'] = this.tempCat.bgcolor;
          this._mhqSnackbarService.triggerMHQSnackbar(true, 'playlist_add', this.tempCat.title, ['A categoria ', ' foi criada com sucesso.']);
        } else {
          this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', '', [`${RESP.slice(1).join('<br>')}`, '']);
        }
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }

  createSubcat(): void { this.tempCat.subcats.push({ ...DEFAULT_FISUBCATEGORY }); }
  deleteSubcat(subcatIndex: number): void { this.tempCat.subcats = this.tempCat.subcats.filter((subcat, i) => subcatIndex !== i); }
}