import { Component } from '@angular/core';
import { CategoriesService } from './content/financial/categories/categories.service';
import { TreasuryService } from './content/financial/treasury-log/treasury.service';

@Component({
  selector: 'mhq-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'hq';
  constructor (private _categoriesService:CategoriesService, private _treasuryService:TreasuryService){};
}
