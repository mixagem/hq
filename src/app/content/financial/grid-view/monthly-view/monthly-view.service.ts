import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ErrorHandlingService } from 'src/assets/services/misc.service';
import { Subject } from 'rxjs';

export type MonthlySnapshots = {
  categories?: any;
  subcategories?: any;
  daily?: number[];
}

@Injectable({
  providedIn: 'root'
})

export class MonthlyViewService {


  loadingComplete: boolean;
  onInitTrigger: Subject<any>;   //trigger para onInit
  monthlySnapshots: MonthlySnapshots;

  constructor(private _http: HttpClient, private _errorHandlingService: ErrorHandlingService) {
    this.loadingComplete = false;
    this.monthlySnapshots = {};
    this.onInitTrigger = new Subject<any>();
    this.getCategoriesMonthlySnapshots((new Date().getFullYear()), (new Date().getMonth()));
  }


  onInitTriggerCall(): void {
    this.onInitTrigger.next('');
  }

  getCategoriesMonthlySnapshots(year: number, month: number) {
    const HTTP_PARAMS = new HttpParams().set('year', year).set('month', month+1).set('monthdays', this.getMonthDays(year, month + 1))
    const CALL = this._http.post('http://localhost:16190/dailycatsevo', HTTP_PARAMS, { responseType: 'json' })

    CALL.subscribe({
      next: codeReceived => {
        this.loadingComplete = false;
        const RESP = codeReceived as any[];
        this.monthlySnapshots.categories = RESP[0];
        this.monthlySnapshots.subcategories = RESP[1];
        this.monthlySnapshots.daily = RESP[2];
        this.loadingComplete = true;
        this.onInitTriggerCall();
      },
      error: err => this._errorHandlingService.handleError(err)
    })
  }

  getMonthDays(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  };
}
