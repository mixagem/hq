import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { CategorySnackBarsService } from 'src/assets/services/snack-bars.service';
import { ErrorHandlingService, LoadingService, TimerService } from 'src/assets/services/misc.service';

type RecordBorderStyle = { "background-color": string }

@Injectable({ providedIn: 'root' })

export class CategoriesService {
  currentSubcategoryDBSequence: number; //valor da sequencia de subcategorias da BD
  onInitTrigger: Subject<any>; // trigger para onInit
  recordBorderStyle: RecordBorderStyle;// estilo a ser aplicado na gaveta do registo
  allCategories: IFinancialCategory[];  // categorias existentes em bd
  expenseCategories: IFinancialCategory[]; // split para re-ordenação das categorias
  incomeCategories: IFinancialCategory[]; // split para re-ordenação das categorias
  cloningCategory: Boolean;  // boolean para verificar se é duplicada ou é criada nova categoria
  activePreviewCategory: IFinancialCategory; // clone da categoria atualmente em consulta utilizado para a duplicação

  constructor(private _categorySnackBarsService: CategorySnackBarsService, private _http: HttpClient, private _router: Router, private _timerService: TimerService, private _loadingService: LoadingService, private _errorHandlingService: ErrorHandlingService) {
    this.allCategories = [];
    this.cloningCategory = false;
    this.fetchCategories(); // vai buscar à bd as categorias e movimentos existentes. quando concluído, passa o loadingComplete = true
    this.onInitTrigger = new Subject<any>(); // trigger para onInit do componente
    this.recordBorderStyle = { "background-color": 'rgb(0,0,0)' };
  }

  // trigger para onInit do componente
  onInitTriggerCall(): void {
    this.onInitTrigger.next('');
  }

  // método para obter o último id utilizado nas categorias em bd
  getCurrentSubcategoriesSequence(): void {
    const CALL = this._http.get('http://localhost:16190/currentsubcategorysequence');
    CALL.subscribe({
      next: (codeReceived) => { this.currentSubcategoryDBSequence = Number(codeReceived) },
      error: err => this._errorHandlingService.handleError(err)
    });
  }

  // vai á bd buscar as categorias
  fetchCategories(source: string = '', catID?: number): void {
    const CALL = this._http.get('http://localhost:16190/fetchcats');
    CALL.subscribe({
      next: (codeReceived) => {
        const RESP = codeReceived as IFinancialCategory[];
        // guardar no serviço a resposta da bd
        this.allCategories = RESP;
        this.expenseCategories = RESP.filter(cat => cat.type === 'expense'); //split para re-ordenação
        this.incomeCategories = RESP.filter(cat => cat.type === 'income'); //split para re-ordenação
        this._loadingService.categoriesLoadingComplete = true; // loading das categorias pronto

        // faz refresh da listagem e do registo em consulta
        if (source === 'saveCategory') { this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/cats', catID]); }); }

        // fecha a gaveta do registo, fecha a modal e faz refresh da listagem
        if (source === 'deleteCategory') {
          document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight');
          this._timerService.timer = setTimeout(navi.bind(null, this._router), 1000);
          function navi(router: Router): void {
            const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
            router.navigateByUrl('/', { skipLocationChange: true }).then(() => { router.navigate(['/fi/cats']); });
          }
        }
        this.onInitTriggerCall();
      },
      error: err => this._errorHandlingService.handleError(err)
    });
  }

  // abre a gaveta do registo e encaminha para o  modo de introdução
  createNewRecord(cloningCategory: boolean): void {
    // verifica se é duplicação ou é introdução normal
    this.cloningCategory = cloningCategory;
    if (!this.cloningCategory) { this.recordBorderStyle = { 'background-color': 'gray' } };
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/cats/add']); });
  }

  // fecha a gaveta do registo
  closeDetails(): void {
    document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')
    this._timerService.timer = setTimeout(navi.bind(null, this._router), 1000)
    function navi(router: Router): void { router.navigate(['/fi/cats']) }
  }

  headerInputsValidation(tempFiCategory: IFinancialCategory): boolean {
    if (tempFiCategory.icon.includes(' ')) {
      this._categorySnackBarsService.triggerCategoriesSnackbar(false, 'report', 'Icon', ['O ', ' encontra-se incorretamente definido.']);
      return false;
    }
    // não consegui utilizar o formControl com o ColorPicker
    if (tempFiCategory.bgcolor.match(/^rgb\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3}\)*$/g) === null) {
      this._categorySnackBarsService.triggerCategoriesSnackbar(false, 'report', 'Cor etiqueta', ['A ', ' encontra-se incorretamente definida.']);
      return false;
    }
    // não consegui utilizar o formControl com o ColorPicker
    if (tempFiCategory.textcolor.match(/^rgb\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3}\)*$/g) === null) {
      this._categorySnackBarsService.triggerCategoriesSnackbar(false, 'report', 'Cor texto', ['A ', ' encontra-se incorretamente definida.']);
      return false;
    }
    // não consegui utilizar o formControl para números indeterminados de inputs
    let areSubcatsBugdgetCorrect = true;
    tempFiCategory.subcats.forEach(subcat => {
      if (!subcat.budget.toString().match(/^[0-9]*$/g)) {
        areSubcatsBugdgetCorrect = false;
      }
    });
    if (!areSubcatsBugdgetCorrect) {
      this._categorySnackBarsService.triggerCategoriesSnackbar(false, 'report', 'Orçamento', ['Existem sub-categorias para as quais o ', ' se encontra incorretamente definido.']);
      return false;
    }
    return true;
  }
}