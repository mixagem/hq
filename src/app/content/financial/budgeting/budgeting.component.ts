import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { LoadingService } from 'src/assets/services/misc.service';
import { CategoriesService } from '../categories/categories.service';
import { TreasuryService } from '../treasury-log/treasury.service';
import { BudgetingService } from './budgeting.service';

@Component({
  selector: 'mhq-budgeting',
  templateUrl: './budgeting.component.html',
  styleUrls: ['./budgeting.component.scss', '../../../../assets/styles/mhq-mainform.scss']
})
export class BudgetingComponent implements OnInit {

  isMatTableReady: Boolean; // estado da construção da tabela (vem depois da comunicação à bd)
  dataSource: MatTableDataSource<ITreasuryLog>;  // datasource para tabela
  displayedColumns: string[];   // array com as colunas da tabela

  constructor(public budgetingService:BudgetingService, public treasuryService: TreasuryService, public categoriesService: CategoriesService, public router: Router, private _loadingService: LoadingService) {
    this.isMatTableReady = false;
  }

  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
    if (!this._loadingService.categoriesLoadingComplete || !this._loadingService.treasuryLoadingComplete) { return }
    this.dataSource.paginator = paginator;
  }

  ngOnInit(): void {
    this.treasuryService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    this.categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    this.budgetingService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this._loadingService.categoriesLoadingComplete || !this._loadingService.treasuryLoadingComplete || !this._loadingService.treasuryLoadingComplete) { return }     // loading check
    this.dataSource = new MatTableDataSource<ITreasuryLog>(this.budgetingService.budgetingLog);     // incializar tabela
    this.displayedColumns = ['cat', 'title', 'date', 'value'];
    this.isMatTableReady = true;
  }

    // navegação para modo de consulta de registo
    viewMode(budgetID: number): void {
      console.log('view mode trigger')
      this.budgetingService.onInitTrigger.complete; this.budgetingService.onInitTrigger = new Subject<any>();
      if (document.querySelector('#mhq-budget-details')?.classList.contains('animate__slideOutRight')) { document.querySelector('#mhq-budget-details')?.classList.replace('animate__slideOutRight', 'animate__slideInRight') }
      this.router.navigateByUrl('/fi/budget', { skipLocationChange: true }).then(() => { this.router.navigate(['/fi/budget', budgetID]); });
    }
}
