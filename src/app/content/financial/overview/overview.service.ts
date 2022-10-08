
import { Injectable, OnInit } from '@angular/core';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';


@Injectable({
  providedIn: 'root'
})

export class OverviewService implements OnInit {

  treasuryLogsForDetails: ITreasuryLog[]

  constructor() { }

  ngOnInit(): void { }

}
