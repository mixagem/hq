import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AdvancedTreasurySearchService } from 'src/app/nav/navbar/treasury-searchbox/advanced-treasury-search/advanced-treasury-search.service';
import { ITreasuryLog } from 'src/shared/interfaces/itreasury-log';
import { LoadingService } from 'src/shared/services/misc.service';
import { CategoriesService } from '../categories/categories.service';
import { TreasuryService } from './treasury.service';

@Component({
  selector: 'mhq-treasury-log',
  templateUrl: './treasury-log.component.html',
  styleUrls: ['./treasury-log.component.scss', '../../../../shared/styles/mhq-mainform.scss']
})

export class TreasuryLogComponent implements OnInit {
  firstLoadingComplete: Boolean;
  isMatTableReady: Boolean;
  dataSource: MatTableDataSource<ITreasuryLog>;
  displayedColumns: string[];

  constructor(public treasuryService: TreasuryService, public categoriesService: CategoriesService, public router: Router, private _loadingService: LoadingService) {
    this.isMatTableReady = false;
    this.firstLoadingComplete = false;
  }

  ngOnInit(): void {
    // loading check
    this.treasuryService.onInitTrigger.subscribe(x => { this.ngOnInit(); }); this.categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });

    if (!this._loadingService.categoriesLoadingComplete || !this._loadingService.treasuryLoadingComplete) { return }

    if (this.firstLoadingComplete && !this.treasuryService.textSearchRefresh) { return }

    this.firstLoadingComplete = true;
    this.treasuryService.textSearchRefresh = false;


    // modo lista
    let dataSourceArray = [];
    for (let i = 0; i < Object.keys(this.treasuryService.tLogTable).length; i++) { dataSourceArray.push(this.treasuryService.tLogTable[Object.keys(this.treasuryService.tLogTable)[i]]) }
    this.dataSource = new MatTableDataSource<ITreasuryLog>(dataSourceArray);
    dataSourceArray = [];
    this.displayedColumns = ['cat', 'title', 'date', 'value'];
    this.isMatTableReady = true;
    // this._advancedTLOGSearch.tlogSearch(true);
  }

  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
    if (!this._loadingService.categoriesLoadingComplete || !this._loadingService.treasuryLoadingComplete) { return }
    this.dataSource.paginator = paginator;
  }

  // navegação para modo de consulta de registo
  viewMode(logID: number): void {
    this.treasuryService.onInitTrigger.complete; this.treasuryService.onInitTrigger = new Subject<any>();
    if (document.querySelector('#mhq-category-details')?.classList.contains('animate__slideOutRight')) { document.querySelector('#mhq-category-details')?.classList.replace('animate__slideOutRight', 'animate__slideInRight') }
    this.router.navigateByUrl('/fi/tlogs', { skipLocationChange: true }).then(() => { this.router.navigate(['/fi/tlogs', logID]); });
  }


  tLogsExist() {
    return Object.keys(this.treasuryService.tLogTable).length > 0 ? true : false
  }
}
