import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';



@Injectable({
  providedIn: 'root'
})
export class FinancialService {

  activeCatBorderColor: string;
  expenseCategories: IFinancialCategory[];
  incomeCategories: IFinancialCategory[];
  activePreviewCategory: IFinancialCategory;
  activeTreasuryLog: ITreasuryLog;
  treasuryLog: ITreasuryLog[];

  constructor(public _http: HttpClient) {
    this.fetchCategories();
    this.fetchTreasuryLog();
    this.activeCatBorderColor = ('55,55,55')
  }

  fetchTreasuryLog(): void {

    const call = this._http.get('http://localhost:16190/gettlogs')
    call.subscribe({
      next: (codeReceived) => {
        const resp = codeReceived as ITreasuryLog[];
        this.treasuryLog = resp;
      }, error: err => this.handleError(err)
    })
  }

  fetchCategories(): void {

    const call = this._http.get('http://localhost:16190/getcats')
    call.subscribe({
      next: (codeReceived) => {
        const resp = codeReceived as IFinancialCategory[];
        this.expenseCategories = resp.filter(cat => cat.type === 'expense');
        this.incomeCategories = resp.filter(cat => cat.type === 'income');
      }, error: err => this.handleError(err)
    })
  }

  handleError(err: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) { errorMessage = `An error has ocurred: ${err.error.message}`; }
    else { errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`; }
    console.log(errorMessage);
    return throwError(() => errorMessage);
  }
}