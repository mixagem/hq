import { Component } from '@angular/core';
import { FinancialService } from './content/financial/financial.service';

@Component({
  selector: 'mhq-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'hq';
  constructor (private _financialService:FinancialService){};
}
