import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GridViewService } from './grid-view.service';

@Component({
  selector: 'mhq-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.scss']
})
export class GridViewComponent implements OnInit {

  constructor(public gridViewService: GridViewService, private _router: Router) { }

  ngOnInit(): void {
    this._router.navigate([`/fi/grid/${this.gridViewService.selectedView}`]);
  }

  changeView(selectedView: string): void {
    this.gridViewService.selectedView = selectedView;
    this._router.navigate([`/fi/grid/${selectedView}`]);
  }

  navigationFix(target: string): void {
    this._router.navigateByUrl(`/fi/${target}`, { skipLocationChange: true }).then(() => { this._router.navigate([`/fi/${target}/add`]); });

  }
}
