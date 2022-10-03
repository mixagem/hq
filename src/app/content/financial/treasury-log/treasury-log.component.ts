import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ITreasuryLog } from 'src/assets/interfaces/itreasury-log';
import { FinancialService } from '../financial.service';

@Component({
  selector: 'mhq-treasury-log',
  templateUrl: './treasury-log.component.html',
  styleUrls: ['./treasury-log.component.scss']
})
export class TreasuryLogComponent implements AfterViewInit {

  dataSource: MatTableDataSource<ITreasuryLog>;
  displayedColumns: string[];

  constructor(public financialService: FinancialService, public router: Router) {
    this.dataSource = new MatTableDataSource<ITreasuryLog>(this.financialService.treasuryLog);
    this.displayedColumns = ['cat', 'title', 'date', 'value'];
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  addTreasuryLog(): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/fi/tlogs/add']);
    });
  }

  getCatStyle(catID: number): string {
    const cat = [...this.financialService.expenseCategories, ...this.financialService.incomeCategories].filter(cat => cat.id == catID)[0];
    return `background:rgb(${cat.bgcolor});color:rgb(${cat.textcolor});`
  }

  getCatLabel(catID: number, subcatID: number): string {
    const maincat = [...this.financialService.expenseCategories, ...this.financialService.incomeCategories].filter(cat => cat.id == catID)[0]
    const subcatTitle = [...maincat.subcats].filter(subcat => subcat.id == subcatID)[0].title;
    return subcatTitle
  }

  getCatIcon(catID: number): string {
    const icon = [...this.financialService.expenseCategories, ...this.financialService.incomeCategories].filter(cat => cat.id == catID)[0].icon
    return icon
  }

  showLogDetails(logID: number, catID: number): void {
    // this.financialService.activeCatBorderColor = [...this.financialService.expenseCategories, ...this.financialService.incomeCategories].filter(cat => cat.id == catID)[0].bgcolor;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/fi/tlogs', logID]);
    });
  }

}
