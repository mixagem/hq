import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, throwError } from 'rxjs';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';

type RecordBorderStyle = {
  "background-color": string
}

@Injectable({
  providedIn: 'root'
})

export class FinancialService implements OnInit {

  //trigger para onInit
  onInitTrigger: Subject<any>;

  // cor a ser utilizada no border dos detalhes da categoria/movimento tesouraria
  recordBorderStyle: RecordBorderStyle;

  // arrays para as categorias existentes em bd
  allCategories: IFinancialCategory[];
  expenseCategories: IFinancialCategory[];
  incomeCategories: IFinancialCategory[];
  // clone da categoria atualmente em consulta
  activePreviewCategory: IFinancialCategory;

  //boolean para verificar se é duplicada ou é criada nova categoria
  cloningCategory: Boolean;


  constructor(private _http: HttpClient, private _router: Router) {
    // vai buscar à bd as categorias e movimentos existentes
    this.fetchCategories();
    this.onInitTrigger = new Subject<any>();
  }

  onInitTriggerCall(): void {
    this.onInitTrigger.next('');
  }

  ngOnInit(): void {
    this.cloningCategory = false;
  }



  //vai á bd buscar as categorias
  fetchCategories(source: string = '', catID?: number): void {

    const call = this._http.get('http://localhost:16190/getcats');

    call.subscribe({
      next: (codeReceived) => {
        const resp = codeReceived as IFinancialCategory[];
        // guardar no serviço a resposta da bd
        this.allCategories = resp;
        this.expenseCategories = resp.filter(cat => cat.type === 'expense');
        this.incomeCategories = resp.filter(cat => cat.type === 'income');

        if (source === 'saveCategories') {
          this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this._router.navigate(['/fi/cats', catID]);
          });
        }

        if (source === 'refreshSubcategories') {
          this.onInitTriggerCall();
        }

        if (source === 'addCategory') {
          // fechar a gaveta do registo
          document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight');

          const timer = setTimeout(navi.bind(null, this._router), 1000);

          function navi(router: Router): void {
            router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              router.navigate(['/fi/cats']);
            });
          }

          this.onInitTriggerCall();

        }

        if (source === 'removeCategory') {
          // fechar a gaveta do registo
          document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight');

          const timer = setTimeout(navi.bind(null, this._router), 1000);

          function navi(router: Router): void {
            //marteladinha para fechar a modal
            const ele = document.querySelector('.cdk-overlay-backdrop') as HTMLElement;
            ele.click();

            router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              router.navigate(['/fi/cats']);
            });
          }

          this.onInitTriggerCall();
        }

      },
      error: err => this.handleError(err)
    });

  }

  // navegação para modo de introdução
  addMode(cloningCategory: boolean): void {

    // verifica se é duplicação ou é introdução normal
    this.cloningCategory = cloningCategory;
    (!this.cloningCategory) ? this.recordBorderStyle = { 'background-color': 'gray' } : [];
    // navegação para modo de introdução de registo
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this._router.navigate(['/fi/cats/add']);
    });

  }

  // fecha a consulta do registo, e retorna para o modo listagem
  closeDetails(): void {

    document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')

    const timer = setTimeout(navi.bind(null, this._router), 1000)

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