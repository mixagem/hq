import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { MiscService } from 'src/assets/services/misc.service';
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

  constructor(public treasuryService: TreasuryService, public categoriesService: CategoriesService, public router: Router, public miscService:MiscService) { }

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

    const categoryBGColor = this.categoriesService.allCategories.filter(cat => cat.id == catID)[0].bgcolor;
    this.treasuryService.recordBorderStyle = { "background-color": categoryBGColor };

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/fi/tlogs', logID]);
    });
  }

}
