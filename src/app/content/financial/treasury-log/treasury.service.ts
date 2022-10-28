import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { ErrorHandlingService, LoadingService, TimerService } from 'src/assets/services/misc.service';

type RecordBorderStyle = { "background-color": string }
type recurencyFrequency = { "string": string, "value": string }

const REC_FREQ: recurencyFrequency[] = [{ string: "Mensal", value: "m" }, { string: "Anual", value: "a" }]

@Injectable({ providedIn: 'root' })

export class TreasuryService {
  tlogEnum: any; // enum
  loadingComplete: Boolean; // boolean com o estado do loading dos movimentos da bd
  onInitTrigger: Subject<any>;   //trigger para onInit
  recordBorderStyle: RecordBorderStyle;   // cor a ser utilizada no border dos detalhes da categoria/movimento tesouraria
  treasuryLog: ITreasuryLog[];   // arrays para os movimentos  existentes em bd
  activeTreasuryLog: ITreasuryLog;   // clone do movimento  atualmente em consulta
  cloningTreasuryLog: Boolean;   // boolean que indica se é duplicação ou intrudução nova
  recurrencyFreq: recurencyFrequency[] // opções frequencia recurrencia
  recurrenyTempTlog: ITreasuryLog

  constructor(private _errorHandlingService: ErrorHandlingService, private _http: HttpClient, private _router: Router, private _loadingService: LoadingService, private _timerService: TimerService) {
    this.cloningTreasuryLog = false;
    this.fetchTreasuryLog();
    this.onInitTrigger = new Subject<any>();
    this.recurrencyFreq = REC_FREQ;
    this.recordBorderStyle = { "background-color": "rgb(0,0,0)" }
  }

  onInitTriggerCall(): void { this.onInitTrigger.next(''); this.onInitTrigger.complete; this.onInitTrigger = new Subject<any>(); }


  // vai á bd buscar os movimentos
  fetchTreasuryLog(source: string = '', LogID?: number): void {
    const CALL = this._http.get('http://localhost:16190/fetchtreasurylogs');

    CALL.subscribe({
      next: (codeReceived) => {
        const RESP = codeReceived as ITreasuryLog[];

        if (source === 'saveTreasuryLog') { this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/tlogs', LogID]); }); }

        if (source === 'deleteTreasuryLog') {
          document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight');
          this._timerService.timer = setTimeout(() => {
            const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
            this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/tlogs']); });
            this.treasuryLog = RESP;
            this.tlogEnum = {}; this.treasuryLog.forEach(tlog => { this.tlogEnum[`${tlog.id}`] = tlog });
            this._loadingService.treasuryLoadingComplete = true;

          }, 750);
        }
        else {
          this.treasuryLog = RESP;
          this.tlogEnum = {}; this.treasuryLog.forEach(tlog => { this.tlogEnum[`${tlog.id}`] = tlog });
          this._loadingService.treasuryLoadingComplete = true;
        }
        this.onInitTriggerCall();
      },
      error: err => this._errorHandlingService.handleError(err)
    });
  }

  // inicia o modo de introdução / duplicação
  addMode(cloningTreasuryLog: boolean): void {
    this.cloningTreasuryLog = cloningTreasuryLog;
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => { this._router.navigate(['/fi/tlogs/add']); });
  }

  // fecha a gaveta e volta para o modo de listagem
  closeDetails(): void {
    document.querySelector('#mhq-category-details')?.classList.replace('animate__slideInRight', 'animate__slideOutRight')
    this._timerService.timer = setTimeout(navi.bind(null, this._router), 750)
    function navi(router: Router): void { router.navigate(['/fi/tlogs']) }
  }
}