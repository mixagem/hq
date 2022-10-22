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

  constructor(public gridViewService: GridViewService, private _categoriesService: CategoriesService, private _router: Router, private _treasuryService: TreasuryService) { }

  changeView(selectedView: string): void {
    this.gridViewService.selectedView = selectedView;
    this._router.navigate([`/fi/grid/${selectedView}`]);
  }

  navigationFix(target: string): void {
    this._categoriesService.cloningCategory = false;
    this._treasuryService.cloningTreasuryLog = false;
    this._router.navigateByUrl(`/fi/${target}`, { skipLocationChange: true }).then(() => { this._router.navigate([`/fi/${target}/add`]); });
  }
}