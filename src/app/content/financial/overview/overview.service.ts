import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { FinancialService } from '../financial.service';
import { TreasuryService } from '../treasury-log/treasury.service';


@Injectable({
  providedIn: 'root'
})

export class OverviewService implements OnInit {

  treasuryLogsForDetails: ITreasuryLog[]

  constructor() {

  }

  ngOnInit(): void {

  }

}
