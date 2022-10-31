import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesService } from '../categories/categories.service';
import { TreasuryService } from '../treasury-log/treasury.service';
import { GridViewService } from './grid-view.service';

@Component({
  selector: 'mhq-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['../../../../assets/styles/mhq-mainform.scss']
})

export class GridViewComponent {

  constructor(public gridViewService: GridViewService, private _categoriesService: CategoriesService, public router: Router, private _treasuryService: TreasuryService) { }

  navigationFix(target: string): void {
    this._categoriesService.cloningCat = false;
    this._treasuryService.cloningTLog = false;
    this.router.navigateByUrl(`/fi/${target}`, { skipLocationChange: true }).then(() => { this.router.navigate([`/fi/${target}/add`]); });
  }
}