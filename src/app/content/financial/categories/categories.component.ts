import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { CategoriesService } from './categories.service';
import { Router } from '@angular/router';
import { LoadingService } from 'src/assets/services/misc.service';
import { MatDialog } from '@angular/material/dialog';
import { ReorderCategoriesModalComponent } from './reorder-categories-modal/reorder-categories-modal.component';

@Component({
  selector: 'mhq-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss', '../../../../assets/styles/mhq-mainform.scss']
})

export class CategoriesComponent implements OnInit {
  isMatTableReady: Boolean; // estado da construção da tabela (vem depois da comunicação à bd)
  dataSource: MatTableDataSource<IFinancialCategory>;  // datasource para tabela
  displayedColumns: string[];  // colunas da tabela

  constructor(public categoriesService: CategoriesService, public router: Router, private _loadingService: LoadingService, private _matDialog: MatDialog) {
    this.isMatTableReady = false;
  }

  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
    if (!this._loadingService.categoriesLoadingComplete) { return } //loading check
    this.dataSource.paginator = paginator;
  }

  ngOnInit(): void {
    //loading check
    this.categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this._loadingService.categoriesLoadingComplete) { return }

    //construção mainform
    this.dataSource = new MatTableDataSource<IFinancialCategory>([...this.categoriesService.allCategories]);
    this.displayedColumns = ['icon', 'title', 'type', 'active'];
    this.isMatTableReady = true;
  }

  // (onclick) modo consulta
  viewRecordDetails(categoryID: number): void {
    //fix para quando consulta-mos enquanto a animção do fecho da gaveta está a fechar -v
    if (document.querySelector('#mhq-category-details')?.classList.contains('animate__slideOutRight')) { document.querySelector('#mhq-category-details')?.classList.replace('animate__slideOutRight', 'animate__slideInRight') }
    this.router.navigateByUrl('/fi/cats', { skipLocationChange: true }).then(() => { this.router.navigate(['/fi/cats', categoryID]); });
  }

  // re-order categories action
  openOrderingModal(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this._matDialog.open(ReorderCategoriesModalComponent, { width: '700px', height: '75vh', enterAnimationDuration, exitAnimationDuration, });
  }
}