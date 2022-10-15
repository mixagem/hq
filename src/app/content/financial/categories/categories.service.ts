import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { ErrorHandlingService, LoadingService, TimerService } from 'src/assets/services/misc.service';

type RecordBorderStyle = { "background-color": string }

@Injectable({
  providedIn: 'root'
})

export class CategoriesService {

  currentSubcategoryDBSequence: number; //valor da sequencia de subcategorias da BD
  onInitTrigger: Subject<any>; // trigger para onInit
  recordBorderStyle: RecordBorderStyle;// estilo a ser aplicado na gaveta do registo
  allCategories: IFinancialCategory[];  // categorias existentes em bd
  expenseCategories: IFinancialCategory[];
  incomeCategories: IFinancialCategory[];
  cloningCategory: Boolean;  // boolean para verificar se é duplicada ou é criada nova categoria
  activePreviewCategory: IFinancialCategory; // clone da categoria atualmente em consulta utilizado para a duplicação

  constructor(private _http: HttpClient, private _router: Router, private _timerService: TimerService, private _loadingService: LoadingService, private _errorHandlingService: ErrorHandlingService) {
    this.cloningCategory = false;
    this.fetchCategories(); // vai buscar à bd as categorias e movimentos existentes. quando concluído, passa o loadingComplete = true
    this.onInitTrigger = new Subject<any>(); // trigger para onInit do componente
  }

  // trigger para onInit do componente
  onInitTriggerCall(): void {
    this.onInitTrigger.next('');
  }

  getCurrentSubcategoriesSequence() {
    const call = this._http.get('http://localhost:16190/currentsubcategorysequence');

    call.subscribe({
      next: (codeReceived) => { this.currentSubcategoryDBSequence = Number(codeReceived) },
      error: err => this._errorHandlingService.handleError(err)
    });
  }

  //vai á bd buscar as categorias
  fetchCategories(source: string = '', catID?: number): void {
    const call = this._http.get('http://localhost:16190/fetchcats');

    call.subscribe({
      next: (codeReceived) => {
        const resp = codeReceived as IFinancialCategory[];

        // guardar no serviço a resposta da bd
        this.allCategories = resp;
        this.expenseCategories = resp.filter(cat => cat.type === 'expense');
        this.incomeCategories = resp.filter(cat => cat.type === 'income');
        this._loadingService.categoriesLoadingComplete = true;

        // faz refresh da listagem e da gaveta
        if (source === 'saveCategory') { this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/cats', catID]); }); }

        // fecha a gaveta do registo, fecha a modal e faz refresh da listagem
        if (source === 'deleteCategory') {

          document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight');

          this._timerService.timer = setTimeout(navi.bind(null, this._router), 1000);
          function navi(router: Router): void {
            const ele = document.querySelector('.cdk-overlay-backdrop') as HTMLElement;
            ele.click(); // fechar a modal
            router.navigateByUrl('/', { skipLocationChange: true }).then(() => { router.navigate(['/fi/cats']); });
          }
        }

        // trigger do OnInit
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

}