import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { CategoriesService } from './categories.service';
import { Router } from '@angular/router';

@Component({
  selector: 'mhq-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss', '../../../../assets/styles/mhq-mainform.scss']
})

export class CategoriesComponent implements OnInit {

  // variável com o estado da construção da tabela (depois da comunicação à bd)
  tablesReady: Boolean;
  // datasource para tabela
  dataSource: MatTableDataSource<IFinancialCategory>;
  // array com as colunas da tabela
  displayedColumns: string[];

  constructor(public categoriesService: CategoriesService, public router: Router) {
    this.tablesReady = false;
  }

  ngOnInit(): void {

    // trigger remoto do OnInit
    this.categoriesService.onInitTrigger.subscribe(nono => {
      this.ngOnInit();
    });

    // se o loading não tiver pronto, interrompe o ngOnInit
    if (!this.categoriesService.loadingComplete) { return }

    // incializar tabela
    this.dataSource = new MatTableDataSource<IFinancialCategory>([...this.categoriesService.allCategories]);
    this.displayedColumns = ['icon', 'title', 'type', 'active'];
    // alterar a variável com o estado da construção da tabela
    this.tablesReady = true;
  }

  // paginador da tabela
  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }


  // navegação para modo de consulta de registo
  viewMode(catID: number): void {

    const categoryBGColor = this.categoriesService.allCategories.filter(cat => cat.id === catID)[0].bgcolor
    this.categoriesService.recordBorderStyle = { "background-color": categoryBGColor };

    // navegação para modo de consulta de registo
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/fi/cats', catID]);
    });
  }

}