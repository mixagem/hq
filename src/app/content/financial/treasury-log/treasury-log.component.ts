import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { LoadingService } from 'src/assets/services/misc.service';
import { CategoriesService } from '../categories/categories.service';
import { TreasuryService } from './treasury.service';

@Component({
  selector: 'mhq-treasury-log',
  templateUrl: './treasury-log.component.html',
  styleUrls: ['./treasury-log.component.scss','../../../../assets/styles/mhq-mainform.scss']
})

export class TreasuryLogComponent implements OnInit {
  isMatTableReady: Boolean; // estado da construção da tabela (vem depois da comunicação à bd)
  dataSource: MatTableDataSource<ITreasuryLog>;  // datasource para tabela
  displayedColumns: string[];   // array com as colunas da tabela

  constructor(public treasuryService: TreasuryService, public categoriesService: CategoriesService, public router: Router, private _loadingService: LoadingService) {
    this.isMatTableReady = false;
  }

  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
    if (!this._loadingService.categoriesLoadingComplete || !this._loadingService.treasuryLoadingComplete) { return }
    this.dataSource.paginator = paginator;
  }

  ngOnInit(): void {
    this.treasuryService.onInitTrigger.subscribe(x => { this.ngOnInit(); });     // triggers remoto do OnInit
    this.categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this._loadingService.categoriesLoadingComplete || !this._loadingService.treasuryLoadingComplete) { return }     // se o loading ainda não estiver pronto, interrompe o ngOnInit
    this.dataSource = new MatTableDataSource<ITreasuryLog>(this.treasuryService.treasuryLog);     // incializar tabela
    this.displayedColumns = ['cat', 'title', 'date', 'value'];
    this.isMatTableReady = true;
  }

  // navegação para modo de consulta de registo
  viewMode(logID: number, catID: number): void {
    this.treasuryService.recordBorderStyle = { "background-color": this.categoriesService.catEnum[catID].bgcolor};
    this.router.navigateByUrl('/fi/tlogs', { skipLocationChange: true }).then(() => { this.router.navigate(['/fi/tlogs', logID]); });
  }
}
