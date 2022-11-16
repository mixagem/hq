import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { IFinancialCategory } from 'src/shared/interfaces/ifinancial-category';
import { IFinancialSubCategory } from 'src/shared/interfaces/ifinancial-sub-category';
import { MHQSnackBarsService } from 'src/shared/services/mhq-snackbar.service';
import { ErrorHandlingService, LoadingService, TimerService } from 'src/shared/services/misc.service';

type CatTable = { [key: string]: IFinancialCategory };
type SubcatTable = { [key: string]: IFinancialSubCategory };
type RecordBorderStyle = { "background-color": string }
type FetchOptions = 'saveCat' | 'deleteCat' | 'loadCat' | 'reorderCat'

@Injectable({ providedIn: 'root' })

export class CategoriesService {

  catTable: CatTable;
  subcatTable: SubcatTable;
  cloningCat: Boolean;  // boolean para verificar se é duplicada ou é criada nova categoria
  activeCat: IFinancialCategory; // clone da categoria atualmente em consulta utilizado para a duplicação
  recordBorderStyle: RecordBorderStyle;// estilo a ser aplicado na gaveta do registo

  onInitTrigger: Subject<any>; // trigger para onInit
  currentSubcategoryDBSequence: number; // valor da sequencia de subcategorias da BD

  constructor(private _mhqSnackbarService: MHQSnackBarsService, private _http: HttpClient, private _router: Router, private _timerService: TimerService, private _loadingService: LoadingService, private _errorHandlingService: ErrorHandlingService) {
    this.cloningCat = false;
    this.onInitTrigger = new Subject<any>(); // trigger para onInit do componente
    this.recordBorderStyle = { "background-color": 'rgb(0,0,0)' };
    this.catTable = {}; this.subcatTable = {};
    this.fetchCategories(); // vai buscar à bd as categorias e movimentos existentes. quando concluído, passa o loadingComplete = true
  }

  // trigger para onInit do componente
  onInitTriggerCall(): void { this.onInitTrigger.next(''); this.onInitTrigger.complete; this.onInitTrigger = new Subject<any>(); }

  // vai á bd buscar as categorias + atualiza o modo de listagem e o registo em consulta
  fetchCategories(source: FetchOptions = 'loadCat', catID?: number): void {

    const CALL = this._http.get('http://localhost/hq/php/cats/fetchcats.php', { responseType: 'json' });
    // const CALL = this._http.get('http://localhost:16190/fetchcats', { responseType: 'json' });

    CALL.subscribe({
      next: (codeReceived) => {
        const ERROR_CODE = codeReceived as string[];
        if (ERROR_CODE[0] === 'MHQERROR') { return this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', ERROR_CODE[1], ['', '']); }
        const RESP = codeReceived as IFinancialCategory[];

        this.catTable = {};
        RESP.forEach(cat => {
          this.catTable[`'${cat.id}'`] = cat;
          cat.subcats.forEach(subcat => { this.subcatTable[`${subcat.id}`] = subcat; });
        });

        this._loadingService.categoriesLoadingComplete = true; // loading das categorias pronto

        switch (source) {

          case 'saveCat':
            this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/cats', catID]); });
            break;

          case 'deleteCat':
            document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight');
            this._timerService.timer = setTimeout(() => {
              const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
              this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/cats']); });
            }, 750);
            break;

          case 'reorderCat':
            this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/cats']); });
            break;
        }

        this.onInitTriggerCall();
      },
      error: err => this._errorHandlingService.handleError(err)
    });
  }

  // abre a gaveta do registo e encaminha para o  modo de introdução
  createNewRecord(cloningCat: boolean): void {
    this.cloningCat = cloningCat;
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/cats/add']); });
  }

  // fecha a gaveta do registo
  closeDetails(): void {
    document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')
    this._timerService.timer = setTimeout(navi.bind(null, this._router), 750)
    function navi(router: Router): void { router.navigate(['/fi/cats']) }
  }

  // método para obter o último id utilizado nas categorias em bd
  getCurrentSubcategoriesSequence(): void {

    const CALL = this._http.get('http://localhost/hq/php/cats/subcatseq.php', { responseType: 'json' });
    // const CALL = this._http.get('http://localhost:16190/currentsubcategorysequence', { responseType: 'json' });
    CALL.subscribe({
      next: (codeReceived) => {
        const RESP = codeReceived as string[];
        if (RESP[0] === 'MHQERROR') { this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', RESP[1], ['', '']); location } else {
          this.currentSubcategoryDBSequence = Number(RESP[0]);
        }
      },
      error: err => { this._errorHandlingService.handleError(err); }
    });
  }

  headerInputsValidation(tempCat: IFinancialCategory): boolean {
    if (tempCat.icon.includes(' ')) {
      this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', 'Icon', ['O ', ' encontra-se incorretamente definido.']);
      return false;
    }
    // não consegui utilizar o formControl com o ColorPicker
    if (tempCat.bgcolor.match(/^rgb\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3}\)*$/g) === null) {
      this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', 'Cor etiqueta', ['A ', ' encontra-se incorretamente definida.']);
      return false;
    }
    // não consegui utilizar o formControl com o ColorPicker
    if (tempCat.textcolor.match(/^rgb\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3}\)*$/g) === null) {
      this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', 'Cor texto', ['A ', ' encontra-se incorretamente definida.']);
      return false;
    }
    // formControl para números indeterminados de inputs dá muita trabalho
    let areSubcatsBugdgetCorrect = true;
    tempCat.subcats.forEach(subcat => {
      if (!subcat.budget.toString().match(/^[0-9]*$/g)) {
        areSubcatsBugdgetCorrect = false;
      }
    });
    if (!areSubcatsBugdgetCorrect) {
      this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', 'Orçamento', ['Existem sub-categorias para as quais o ', ' se encontra incorretamente definido.']);
      return false;
    }
    return true;
  }
}