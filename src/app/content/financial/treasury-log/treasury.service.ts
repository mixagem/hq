import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { ErrorHandlingService, LoadingService, TimerService } from 'src/assets/services/misc.service';
import { MHQSnackBarsService } from 'src/assets/services/mhq-snackbar.service';

type TLogTable = { [key: string]: ITreasuryLog };
type RecordBorderStyle = { "background-color": string };
type FetchOptions = 'saveTLog' | 'deleteTLog' | 'loadTLog';
type recurencyFrequency = { "string": string, "value": string };

const REC_FREQ: recurencyFrequency[] = [{ string: "Mensal", value: "m" }, { string: "Anual", value: "a" }];

@Injectable({ providedIn: 'root' })

export class TreasuryService {

  recurrencyFreq: recurencyFrequency[] = [...REC_FREQ]; // opções frequencia recurrencia

  tLogTable: TLogTable; // movimentos vindos da bd
  cloningTLog: Boolean;   // boolean que indica se é duplicação ou intrudução novo registo
  activeTLog: ITreasuryLog;   // clone do movimento  atualmente em consulta. recebe o objeto quando acede em consulta, e é utilizado noutros componentes (tipo modals)
  recordBorderStyle: RecordBorderStyle;   // cor a ser utilizada no border dos detalhes da categoria/movimento tesouraria

  onInitTrigger: Subject<any>;   //trigger para onInit

  constructor(private _errorHandlingService: ErrorHandlingService, private _http: HttpClient, private _router: Router, private _loadingService: LoadingService, private _timerService: TimerService, private _mhqSnackbarService: MHQSnackBarsService) {
    this.cloningTLog = false;
    this.onInitTrigger = new Subject<any>();
    this.recordBorderStyle = { "background-color": "rgb(0,0,0)" };
    this.fetchTreasuryLog();
  }

  onInitTriggerCall(): void { this.onInitTrigger.next(''); this.onInitTrigger.complete; this.onInitTrigger = new Subject<any>(); }


  // vai á bd buscar os movimentos
  fetchTreasuryLog(source: FetchOptions = 'loadTLog', LogID?: number): void {
    const CALL = this._http.get('http://localhost:16190/fetchtreasurylogs');

    CALL.subscribe({
      next: (codeReceived) => {
        const ERROR_CODE = codeReceived as string[];
        if (ERROR_CODE[0] === 'MHQERROR') { return this._mhqSnackbarService.triggerMHQSnackbar(false, 'warning_amber', ERROR_CODE[1], ['', '']); }
        const RESP = codeReceived as ITreasuryLog[];

        this.tLogTable = {}; RESP.forEach(tlog => { this.tLogTable[`'${tlog.id}'`] = tlog; });
        this._loadingService.treasuryLoadingComplete = true;

        switch (source) {
          case 'saveTLog':
            this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/tlogs', LogID]); });
            break;

          case 'deleteTLog':
            document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight');
            this._timerService.timer = setTimeout(() => {
              const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
              this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/tlogs']); });
            }, 750);
            break;
        }

        this.onInitTriggerCall();
      },
      error: err => this._errorHandlingService.handleError(err)
    });
  }

  // inicia o modo de introdução / duplicação
  createNewRecord(cloningTLog: boolean): void {
    this.cloningTLog = cloningTLog;
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/tlogs/add']); });
  }

  // fecha a gaveta e volta para o modo de listagem
  closeDetails(): void {
    document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight');
    this._timerService.timer = setTimeout(navi.bind(null, this._router), 750);
    function navi(router: Router): void { router.navigate(['/fi/tlogs']); };
  }
}