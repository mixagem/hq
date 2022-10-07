import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, throwError } from 'rxjs';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { FinancialService } from '../financial.service';

type RecordBorderStyle = {
  "background-color": string
}

@Injectable({
  providedIn: 'root'
})

export class TreasuryService {

  loadingComplete: Boolean;

  //trigger para onInit
  onInitTrigger: Subject<any>;

  // cor a ser utilizada no border dos detalhes da categoria/movimento tesouraria
  recordBorderStyle: RecordBorderStyle;

  // arrays para os movimentos  existentes em bd
  treasuryLog: ITreasuryLog[];

  // clone do movimento  atualmente em consulta
  activeTreasuryLog: ITreasuryLog;

  cloningTLog: Boolean;

  constructor(private _http: HttpClient, private _router: Router, private financialService: FinancialService) {
    this.loadingComplete = false;
    this.fetchTreasuryLog();
    this.onInitTrigger = new Subject<any>();
  }

  onInitTriggerCall(): void {
    this.onInitTrigger.next('');
  }

  ngOnInit(): void {
    this.cloningTLog = false;
  }

  // vai á bd buscar os movimentos
  fetchTreasuryLog(source: string = '', LogID?: number): void {

    const call = this._http.get('http://localhost:16190/gettlogs');

    call.subscribe({
      next: (codeReceived) => {
        const resp = codeReceived as ITreasuryLog[];
        // guardar no serviço a resposta da bd
        this.treasuryLog = resp;
        this.loadingComplete = true;
        
        if (source === 'saveTreasuryLog') {
          this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this._router.navigate(['/fi/tlogs', LogID]);
          });


        }

        if (source === 'removeTreasuryLog') {
          // fechar a gaveta do registo
          document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight');

          const timer = setTimeout(navi.bind(null, this._router), 1000);

          function navi(router: Router): void {
            //marteladinha para fechar a modal
            const ele = document.querySelector('.cdk-overlay-backdrop') as HTMLElement;
            ele.click();

            router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              router.navigate(['/fi/tlogs']);
            });
          }


        }
        this.onInitTriggerCall();

      },
      error: err => this.handleError(err)
    });

  }

  addMode(cloningTLog: boolean): void {

    // verifica se é duplicação ou é introdução normal
    this.cloningTLog = cloningTLog;
    (!this.cloningTLog) ? this.recordBorderStyle = { 'background-color': 'gray' } : [];

    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this._router.navigate(['/fi/tlogs/add']);
    });
  }

  closeDetails(): void {

    document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')

    const timer = setTimeout(navi.bind(null, this._router), 1000)

    function navi(router: Router): void {
      router.navigate(['/fi/tlogs'])
    }

  }

  // utilizado no render da listagem
  getCatStyle(catID: number): string {
    let style: string;
    const cat = [...this.financialService.allCategories].forEach(cat => {
      if (cat.id == catID) return style = `background:rgb(${cat.bgcolor});color:rgb(${cat.textcolor});`
      return;
    });
    return style!;
  }

  getCatLabel(catID: number): string {

    let mainCat: IFinancialCategory;

    [...this.financialService.allCategories].forEach(cat => {
      if (cat.id == catID) return mainCat = cat
      return;
    });

    return mainCat!.title;
  }

  // utilizado no render da listagem
  getSubCatLabel(catID: number, subcatID: number): string {

    let mainCat: IFinancialCategory;

    [...this.financialService.allCategories].forEach(cat => {
      if (cat.id == catID) return mainCat = cat
      return;
    });

    let subCatTitle: string;

    [...mainCat!.subcats].forEach(subcat => {
      if (subcat.id == subcatID) return subCatTitle = subcat.title
      return;
    });

    return subCatTitle!;
  }

  // utilizado no render da listagem
  getCatIcon(catID: number): string {

    let icon: string;

    [...this.financialService.allCategories].forEach(cat => {
      if (cat.id == catID) return icon = cat.icon
      return
    });

    return icon!
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
