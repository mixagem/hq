import { Injectable } from '@angular/core';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
// import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FinancialService {

  expanseCategories: IFinancialCategory[];
  incomeCategories: IFinancialCategory[];

  zeka: IFinancialCategory = {
    id: 'aaa',
    type: 'expense',
    title: 'Primeira',
    icon: 'dns',
    bgcolor: 'blue',
    textcolor: 'black',
    active: false,
    subcats: [{
      id: 'bbb',
      maincat: 'aaa',
      title: 'Primeira Sub',
      budget: 0,
      active: false
    }]
  };

  zeka2: IFinancialCategory = {
    id: 'ccc',
    type: 'expense',
    title: 'Segunda',
    icon: 'dns',
    bgcolor: 'red',
    textcolor: 'black',
    active: false,
    subcats: [{
      id: 'ddd',
      maincat: 'ccc',
      title: 'Segunda Sub',
      budget: 0,
      active: false
    }]
  };

  zeka3: IFinancialCategory = {
    id: 'eee',
    type: 'income',
    title: 'Terceira',
    icon: 'dns',
    bgcolor: 'green',
    textcolor: 'black',
    active: false,
    subcats: [{
      id: 'fff',
      maincat: 'eee',
      title: 'Terceira Sub',
      budget: 0,
      active: false
    }]
  };

  constructor() {
    this.expanseCategories = [this.zeka, this.zeka2]
    this.incomeCategories = [this.zeka3]

    // this.getCategories();



  }

  // getCategories(): void {

  //   const call = this._http.get('http://localhost:6190/getcats')

  //   call.subscribe({
  //     next: (codeReceived) => {
  //       console.log(codeReceived)
  //       const resp = codeReceived as IFinancialCategory[];
  //       this.expanseCategories = resp.filter(cat => cat.type === 'expanse');
  //       this.incomeCategories = resp.filter(cat => cat.type === 'income');
  //     }, error: err => this.handleError(err)
  //   })
  // }

  // private handleError(err: HttpErrorResponse): Observable<never> {
  //   let errorMessage = '';
  //   if (err.error instanceof ErrorEvent) { errorMessage = `An error has ocurred: ${err.error.message}`; }
  //   else { errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`; }
  //   console.log(errorMessage);
  //   return throwError(() => errorMessage);

  // }
}