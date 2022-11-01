import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

///////////////////////////////////////////////////////////////

@Injectable({ providedIn: 'root' })

export class ErrorHandlingService {
  handleError(err: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) { errorMessage = `An error has ocurred: ${err.error.message}`; }
    else { errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`; }
    console.log(errorMessage);
    return throwError(() => errorMessage);
  }
}

///////////////////////////////////////////////////////////////

@Injectable({ providedIn: 'root' })

export class TimerService { timer: any; }

///////////////////////////////////////////////////////////////

@Injectable({ providedIn: 'root' })

export class LoadingService {

  // variável com o estado da comunicação à bd
  categoriesLoadingComplete: Boolean;
  treasuryLoadingComplete: Boolean;
  budgetingLoadingComplete: Boolean;

  constructor() {
    this.categoriesLoadingComplete = false;
    this.treasuryLoadingComplete = false;
    this.budgetingLoadingComplete = false;
  }
}