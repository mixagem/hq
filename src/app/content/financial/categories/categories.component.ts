import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { FinancialService } from '../financial.service';
import { Router } from '@angular/router';

@Component({
  selector: 'mhq-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})

export class CategoriesComponent implements AfterViewInit, OnInit {

  // datasource para tabela
  dataSource: MatTableDataSource<IFinancialCategory>;
  // array com as colunas da tabela
  displayedColumns: string[];

  constructor(public financialService: FinancialService, public router: Router) {

  }

  ngOnInit(): void {
    // incializar tabela
    this.dataSource = new MatTableDataSource<IFinancialCategory>([...this.financialService.allCategories]);
    this.displayedColumns = ['icon', 'title', 'type', 'active'];
  }

  // paginador da tabela
  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  // navegação para modo de introdução de registo
  addMode(): void {

    // atualiza a cor do border a ser utilizada na introdução de registo
    this.financialService.recordBorderStyle = { "border-left": '30px dashed red' }

    // navegação para modo de introdução de registo
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/fi/cats/add']);
    });

  }

  // navegação para modo de consulta de registo
  viewMode(catID: number): void {

    // loop para obter a cor do border da categoria para aplicar na consulta do registo
    this.financialService.allCategories.forEach(cat => {
      if (cat.id === catID) { this.financialService.recordBorderStyle = { "border-left": '30px solid rgb(' + cat.bgcolor + ')' }; return }
    });

    // navegação para modo de consulta de registo
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/fi/cats', catID]);
    });
  }

}