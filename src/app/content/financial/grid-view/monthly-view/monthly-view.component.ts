
import { Component, OnInit } from '@angular/core';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { LoadingService, MiscService } from 'src/assets/services/misc.service';
import { CategoriesService } from '../../categories/categories.service';
import { TreasuryService } from '../../treasury-log/treasury.service';
import { MonthlyViewService } from './monthly-view.service';

@Component({
  selector: 'mhq-monthly-view',
  templateUrl: './monthly-view.component.html',
  styleUrls: ['./monthly-view.component.scss']
})
export class MonthlyViewComponent implements OnInit {

  placeholder: Array<number>; //utilizado no ngFor com o número de dias do mês
  activeCategories: IFinancialCategory[]
  areCategoriesReady: boolean;

  constructor(public monthlyService: MonthlyViewService, private _categoriesService: CategoriesService, private _treasuryService: TreasuryService, private _loadingService: LoadingService, public miscService: MiscService) {
    this.areCategoriesReady = false;
  }

  ngOnInit(): void {
    this._treasuryService.onInitTrigger.subscribe(x => { this.ngOnInit(); });     // triggers remoto do OnInit
    this._categoriesService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    this.monthlyService.onInitTrigger.subscribe(x => { this.ngOnInit(); });
    if (!this._loadingService.categoriesLoadingComplete || !this._loadingService.treasuryLoadingComplete) { return }
    this.placeholder = new Array(this.monthlyService.getMonthDays(new Date(Date.now()).getFullYear(), new Date(Date.now()).getMonth() + 1)).fill(0);
    this.activeCategories = [...this._categoriesService.incomeCategories, ...this._categoriesService.expenseCategories].filter(category => category.active);
    this.areCategoriesReady = true;
  }

  changeMonth(target: number): void {
    if (target === -1) {


      this.monthlyService.getCategoriesMonthlySnapshots(0, 0)

    }
    // if (target === 1) { this.monthlyService.getCategoriesMonthlySnapshots(0, 0) }
  }





}