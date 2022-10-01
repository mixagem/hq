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
export class CategoriesComponent implements AfterViewInit {


  dataSource: MatTableDataSource<IFinancialCategory>;
  displayedColumns: string[];

  constructor(public financialService: FinancialService, public router: Router) {
    this.dataSource = new MatTableDataSource<IFinancialCategory>([...this.financialService.expenseCategories, ...this.financialService.incomeCategories]);
    this.displayedColumns = ['icon', 'title', 'type', 'active'];
  }


  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  showCategoryDetails(categoryID: number) {
    this.financialService.activeCatBorderColor = [...this.financialService.expenseCategories, ...this.financialService.incomeCategories].filter(cat => cat.id === categoryID)[0].bgcolor;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/fi/cats', categoryID]);
    });
  }

}
