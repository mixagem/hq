import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { CategoriesService } from './categories.service';
import { Router } from '@angular/router';
import { LoadingService, MiscService } from 'src/assets/services/misc.service';

@Component({
  selector: 'mhq-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss', '../../../../assets/styles/mhq-mainform.scss']
})

export class CategoriesComponent implements OnInit {
  isMatTableReady: Boolean; // estado da construção da tabela (vem depois da comunicação à bd)
  dataSource: MatTableDataSource<IFinancialCategory>;  // datasource para tabela
  displayedColumns: string[];  // colunas da tabela

  constructor(public categoriesService: CategoriesService, public router: Router, private _miscService: MiscService, private _loadingService: LoadingService) {
    this.isMatTableReady = false;
  }

  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
    if (!this._loadingService.categoriesLoadingComplete) { return }
    this.dataSource.paginator = paginator;
  }

  ngOnInit(): void {
    this.categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this._loadingService.categoriesLoadingComplete) { return }
    this.dataSource = new MatTableDataSource<IFinancialCategory>([...this.categoriesService.allCategories]);
    this.displayedColumns = ['icon', 'title', 'type', 'active'];
    this.isMatTableReady = true;
  }

  // (onclick) nos registos de categoria
  viewRecordDetails(categoryID: number): void {
    this.categoriesService.recordBorderStyle = { "background-color": this._miscService.getCategoryStyles(categoryID)['background-color'] };
    this.router.navigateByUrl('/fi/cats', { skipLocationChange: true }).then(() => { this.router.navigate(['/fi/cats', categoryID]); });
  }
}