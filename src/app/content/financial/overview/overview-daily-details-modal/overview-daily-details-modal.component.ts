import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { MiscService } from 'src/assets/services/misc.service';
import { CategoriesService } from '../../categories/categories.service';
import { TreasuryService } from '../../treasury-log/treasury.service';
import { OverviewService } from '../overview.service';

@Component({
  selector: 'mhq-overview-daily-details-modal',
  templateUrl: './overview-daily-details-modal.component.html',
  styleUrls: ['./overview-daily-details-modal.component.scss', '../../../../../assets/styles/mhq-large-modal.scss']
})
export class OverviewDailyDetailsModalComponent implements OnInit {

  // datasource para tabela
  dataSource: MatTableDataSource<ITreasuryLog>;
  isDataSourceEmpty: Boolean;

  // array com as colunas da tabela
  displayedColumns: string[];

  constructor(public categoriesService: CategoriesService, public overviewService: OverviewService, public miscService: MiscService, private _router: Router, private _treasuryService: TreasuryService) {
    // this.tablesReady = false;
  }

  ngOnInit(): void {

    this.dataSource = new MatTableDataSource<ITreasuryLog>([...this.overviewService.treasuryLogsForDetails]);

    this.overviewService.treasuryLogsForDetails.length === 0 ? this.isDataSourceEmpty = true : this.isDataSourceEmpty = false;

    switch (this.overviewService.source) {

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

  // paginador da tabela
  @ViewChild(MatPaginator) paginator: MatPaginator;
  // afterViewInit para tabela
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  goToTreasuryLog(treasuryLogID: number, categoryID: number) {
    const ele = document.querySelector('.cdk-overlay-backdrop') as HTMLElement;
    ele.click();
    this._treasuryService.recordBorderStyle = { 'background-color': this.miscService.getCatStyleSimplex(categoryID)[0] }
    this._router.navigate(['/fi/tlogs', treasuryLogID]);
  }

}
