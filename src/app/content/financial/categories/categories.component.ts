import { AfterViewInit, Component, ViewChild } from '@angular/core';
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
export class CategoriesComponent implements AfterViewInit {

  dataSource: MatTableDataSource<IFinancialCategory>;
  displayedColumns: string[];

  constructor(private _financialService: FinancialService, public router: Router) {
    this.dataSource = new MatTableDataSource<IFinancialCategory>([...this._financialService.expenseCategories, ...this._financialService.incomeCategories]);
    this.displayedColumns = ['id', 'title', 'type', 'color', 'inactive'];
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  showCategoryDetails(categoryID: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/fi/cats', categoryID]);
    });
  }

}
