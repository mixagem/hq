import { Component } from '@angular/core';
import { FinancialService } from './content/financial/financial.service';
import { OverviewService } from './content/financial/overview/overview.service';
import { TreasuryService } from './content/financial/treasury-log/treasury.service';

@Component({
  selector: 'mhq-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'hq';
  constructor (private _financialService:FinancialService, private _treasuryService:TreasuryService){};
}
