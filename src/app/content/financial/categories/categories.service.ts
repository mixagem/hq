import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, throwError } from 'rxjs';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { MiscService, TimerService } from 'src/assets/services/misc.service';

type RecordBorderStyle = {
  "background-color": string
}

@Injectable({
  providedIn: 'root'
})

export class CategoriesService {

  // variável com o estado da comunicação à bd
  loadingComplete: Boolean;

  // trigger para onInit
  onInitTrigger: Subject<any>;

  // cor a ser utilizada no border dos detalhes da categoria/movimento tesouraria
  recordBorderStyle: RecordBorderStyle;

  // arrays para as categorias existentes em bd
  allCategories: IFinancialCategory[];
  expenseCategories: IFinancialCategory[];
  incomeCategories: IFinancialCategory[];

  // clone da categoria atualmente em consulta
  activePreviewCategory: IFinancialCategory;

  // boolean para verificar se é duplicada ou é criada nova categoria
  cloningCategory: Boolean;

  constructor(private _http: HttpClient, private _router: Router, private _timerService:TimerService) {
    this.loadingComplete = false;
    this.cloningCategory = false;
    this.fetchCategories(); // vai buscar à bd as categorias e movimentos existentes. quando concluído, passa o loadingComplete = true
    this.onInitTrigger = new Subject<any>(); // trigger para onInit do componente
  }

  // trigger para onInit do componente
  onInitTriggerCall(): void {
    this.onInitTrigger.next('');
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
        this.loadingComplete = true;

        // faz refresh da listagem e da gaveta
        if (source === 'saveCategory') {
          this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this._router.navigate(['/fi/cats', catID]);
          });
        }

        // fecha a gaveta do registo, fecha a modal e faz refresh da listagem
        if (source === 'deleteCategory') {

          document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight');

          // clearTimeout(this._timerService.timer);
          this._timerService.timer = setTimeout(navi.bind(null, this._router), 1000);
          function navi(router: Router): void {
            // fechar a modal
            const ele = document.querySelector('.cdk-overlay-backdrop') as HTMLElement;
            ele.click();

            router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              router.navigate(['/fi/cats']);
            });
          }

        }

        // refresh do OnInit
        this.onInitTriggerCall();

      },
      error: err => this.handleError(err)
    });

  }

  // abre a gaveta do registo em modo de introdução
  addMode(cloningCategory: boolean): void {

    // verifica se é duplicação ou é introdução normal
    this.cloningCategory = cloningCategory;
    (!this.cloningCategory) ? this.recordBorderStyle = { 'background-color': 'gray' } : [];

    // navegação para modo de introdução de registo
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this._router.navigate(['/fi/cats/add']);
    });

  }

  // fecha a gaveta do registo
  closeDetails(): void {

    document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')

    // clearTimeout(this._timerService.timer);
    this._timerService.timer = setTimeout(navi.bind(null, this._router), 1000)
    function navi(router: Router): void {
      router.navigate(['/fi/cats'])
    }

  }

  // tratamento erros
  handleError(err: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) { errorMessage = `An error has ocurred: ${err.error.message}`; }
    else { errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`; }
    console.log(errorMessage);
    return throwError(() => errorMessage);
  }
}