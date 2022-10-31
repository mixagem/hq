import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { MHQSnackBarsService } from 'src/assets/services/mhq-snackbar.service';
import { ErrorHandlingService, LoadingService, TimerService } from 'src/assets/services/misc.service';

type RecordBorderStyle = { "background-color": string }
type recurencyFrequency = { "string": string, "value": string }

const REC_FREQ: recurencyFrequency[] = [{ string: "Mensal", value: "m" }, { string: "Anual", value: "a" }]


@Injectable({
  providedIn: 'root'
})

export class BudgetingService {
  budgetEnum: any; // enum
  loadingComplete: Boolean; // boolean com o estado do loading dos movimentos da bd
  onInitTrigger: Subject<any>;   //trigger para onInit
  recordBorderStyle: RecordBorderStyle;   // cor a ser utilizada no border dos detalhes da categoria/movimento tesouraria
  budgetLog: ITreasuryLog[];   // arrays para os movimentos  existentes em bd
  activeBudgetLog: ITreasuryLog;   // clone do movimento  atualmente em consulta
  cloningBudgetLog: Boolean;   // boolean que indica se é duplicação ou intrudução nova
  recurrencyFreq: recurencyFrequency[] // opções frequencia recurrencia
  recurrenyTempBudgetlog: ITreasuryLog

  constructor(private _errorHandlingService: ErrorHandlingService, private _http: HttpClient, private _router: Router, private _loadingService: LoadingService, private _timerService: TimerService, private _mhqSnackbarService : MHQSnackBarsService) {
    this.cloningBudgetLog = false;
    this.fetchBudgetLog();
    this.onInitTrigger = new Subject<any>();
    this.recurrencyFreq = REC_FREQ;
    this.recordBorderStyle = { "background-color": "rgb(0,0,0)" }
  }

  onInitTriggerCall(): void { this.onInitTrigger.next(''); this.onInitTrigger.complete; this.onInitTrigger = new Subject<any>(); }

    // vai á bd buscar os movimentos
    fetchBudgetLog(source: string = '', LogID?: number): void {
      const CALL = this._http.get('http://localhost:16190/fetchbudgets');

      CALL.subscribe({
        next: (codeReceived) => {
          const ERROR_CODE = codeReceived as string[];
          if (ERROR_CODE[0] === 'MHQERROR') { return this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', ERROR_CODE[1], ['', '']); }
          const RESP = codeReceived as ITreasuryLog[];

          if (source === 'saveBudgetLog') { this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/budget', LogID]); }); }

          if (source === 'deleteBudgetLog') {
            document.querySelector('#mhq-budget-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight');
            this._timerService.timer = setTimeout(() => {
              const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
              this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/budget']); });
              this.budgetLog = RESP;
              this.budgetEnum = {}; this.budgetLog.forEach(tlog => { this.budgetEnum[`${tlog.id}`] = tlog });
              this._loadingService.budgetingLoadingComplete = true;

            }, 750);
          }
          else {
            this.budgetLog = RESP;
            this.budgetEnum = {}; this.budgetLog.forEach(tlog => { this.budgetEnum[`${tlog.id}`] = tlog });
            this._loadingService.budgetingLoadingComplete = true;
          }
          this.onInitTriggerCall();
        },
        error: err => this._errorHandlingService.handleError(err)
      });
    }

    // inicia o modo de introdução / duplicação
    createNewRecord(cloningBudgetLog: boolean): void {
      this.cloningBudgetLog = cloningBudgetLog;
      this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/budget/add']); });
    }

    // fecha a gaveta e volta para o modo de listagem
    closeDetails(): void {
      document.querySelector('#mhq-budget-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')
      this._timerService.timer = setTimeout(navi.bind(null, this._router), 750)
      function navi(router: Router): void { router.navigate(['/fi/budget']) }
    }
}
