import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { CategoriesService } from '../categories/categories.service';
import { TreasuryService } from './treasury.service';

@Component({
  selector: 'mhq-treasury-log',
  templateUrl: './treasury-log.component.html',
  styleUrls: ['./treasury-log.component.scss', '../../../../assets/styles/mhq-mainform.scss']
})

export class TreasuryLogComponent implements AfterViewInit, OnInit {

  // datasource para tabela
  dataSource: MatTableDataSource<ITreasuryLog>;
  // array com as colunas da tabela
  displayedColumns: string[];
  // paginador da tabela
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public treasuryService: TreasuryService, public categoriesService: CategoriesService, public router: Router) { }

  ngOnInit(): void {

    // trigger remoto do OnInit
    this.treasuryService.onInitTrigger.subscribe(myCustomParam => {
      this.ngOnInit();
    });

    // se o loading ainda não estiver pronto, interrompe o ngOnInit
    if (!this.treasuryService.loadingComplete) { return }

    // incializar tabela
    this.dataSource = new MatTableDataSource<ITreasuryLog>(this.treasuryService.treasuryLog);
    this.displayedColumns = ['cat', 'title', 'date', 'value'];
    this.ngAfterViewInit();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  // navegação para modo de consulta de registo
  viewMode(logID: number, catID: number): void {

    // obter a cor da categoria para estilo da gaveta
    this.categoriesService.allCategories.forEach(cat => {
      if (cat.id == catID) { this.treasuryService.recordBorderStyle = { "background-color": cat.bgcolor }; return }
    });

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/fi/tlogs', logID]);
    });
  }

}
