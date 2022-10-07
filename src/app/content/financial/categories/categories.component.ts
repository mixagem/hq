import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { FinancialService } from '../financial.service';
import { Router } from '@angular/router';

@Component({
  selector: 'mhq-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss','../../../../assets/styles/mhq-mainform.scss']
})

export class CategoriesComponent implements AfterViewInit, OnInit {

  tablesReady: Boolean;

  // datasource para tabela
  dataSource: MatTableDataSource<IFinancialCategory>;
  // array com as colunas da tabela
  displayedColumns: string[];

  constructor(public financialService: FinancialService, public router: Router) {
    this.tablesReady = false;
   }

  ngOnInit(): void {
    // trigger remoto do OnInit
    this.financialService.onInitTrigger.subscribe(myCustomParam => {
      this.ngOnInit();
      this.ngAfterViewInit();
    });
    if(!this.financialService.loadingComplete){return}
    // incializar tabela
    this.dataSource = new MatTableDataSource<IFinancialCategory>([...this.financialService.allCategories]);
    this.displayedColumns = ['icon', 'title', 'type', 'active'];
    this.tablesReady = true;
  }

  // paginador da tabela
  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngAfterViewInit(): void {
    if(!this.financialService.loadingComplete){return}
    this.dataSource.paginator = this.paginator;
  }

  // navegação para modo de consulta de registo
  viewMode(catID: number): void {

    // loop para obter a cor do border da categoria para aplicar na consulta do registo
    this.financialService.allCategories.forEach(cat => {
      if (cat.id === catID) { this.financialService.recordBorderStyle = { "background-color": 'rgb(' + cat.bgcolor + ')' }; return }
    });

    // navegação para modo de consulta de registo
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/fi/cats', catID]);
    });
  }

}