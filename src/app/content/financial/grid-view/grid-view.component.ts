import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesService } from '../categories/categories.service';
import { TreasuryService } from '../treasury-log/treasury.service';

@Component({
  selector: 'mhq-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['../../../../shared/styles/mhq-mainform.scss']
})

export class GridViewComponent {

  constructor( private _categoriesService: CategoriesService, public router: Router, private _treasuryService: TreasuryService) { }

  navigationFix(target: string): void {
    this._categoriesService.cloningCat = false;
    this._treasuryService.cloningTLog = false;
    this.router.navigateByUrl(`/fi/${target}`, { skipLocationChange: true }).then(() => { this.router.navigate([`/fi/${target}/add`]); });
  }
}