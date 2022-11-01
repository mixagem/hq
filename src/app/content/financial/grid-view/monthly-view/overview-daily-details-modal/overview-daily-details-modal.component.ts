import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ITreasuryLog } from 'src/shared/interfaces/itreasury-log';
import { CategoriesService } from '../../../categories/categories.service';
import { GridViewService } from '../../grid-view.service';

@Component({
  selector: 'mhq-overview-daily-details-modal',
  templateUrl: './overview-daily-details-modal.component.html',
  styleUrls: ['./overview-daily-details-modal.component.scss', '../../../../../../shared/styles/mhq-large-modal.scss']
})
export class OverviewDailyDetailsModalComponent implements OnInit {
  dataSource: MatTableDataSource<ITreasuryLog>;
  isDataSourceEmpty: Boolean;
  displayedColumns: string[];

  constructor(public categoriesService: CategoriesService, public gridViewService:GridViewService,  private _router: Router) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<ITreasuryLog>(this.gridViewService.treasuryLogsForDetails);
    this.gridViewService.treasuryLogsForDetails.length === 0 ? this.isDataSourceEmpty = true : this.isDataSourceEmpty = false;
    switch (this.gridViewService.source) {
      case 'category':
        this.displayedColumns = ['subcat', 'title', 'value', 'link'];
        break;

      case 'subcategory':
        this.displayedColumns = ['title', 'value', 'link'];
        break;

      case 'daily':
        this.displayedColumns = ['icon', 'subcat', 'title', 'value', 'link'];
        break;
    }
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  goToTreasuryLog(treasuryLogID: number) {
    const ELE = document.querySelector('.cdk-overlay-backdrop') as HTMLElement; ELE.click();
    this._router.navigate(['/fi/tlogs', treasuryLogID]);
  }
}
