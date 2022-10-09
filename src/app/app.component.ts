import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { MiscService, TimerService } from 'src/assets/services/misc.service';
import { CategoriesService } from './content/financial/categories/categories.service';
import { TreasuryService } from './content/financial/treasury-log/treasury.service';


@Component({
  selector: 'mhq-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'hq';

  constructor(private _categoriesService: CategoriesService, private _treasuryService: TreasuryService, private _router: Router, private _timerService:TimerService) {

    this._router.events.forEach((event) => {if (event instanceof NavigationStart) { clearTimeout(this._timerService.timer) }});

  }
}