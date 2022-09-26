import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';
import { FinancialService } from '../../financial.service';

@Component({
  selector: 'mhq-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.scss']
})
export class CategoryDetailsComponent implements OnInit {
  id: string;
  fiCategory: IFinancialCategory

  constructor(private _route: ActivatedRoute, private _financialService: FinancialService) { }

  ngOnInit(): void {
    this.id = this._route.snapshot.paramMap.get('id')!;
    this.fiCategory = [...this._financialService.expanseCategories,...this._financialService.incomeCategories].filter(obj => {
      return obj.id === this.id
    })[0];
  }
}
