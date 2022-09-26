import { Injectable } from '@angular/core';
import { IFinancialCategory } from 'src/assets/interfaces/ifinancial-category';

@Injectable({
  providedIn: 'root'
})
export class FinancialService {

  expanseCategories: IFinancialCategory[];
  incomeCategories: IFinancialCategory[];

  zeka: IFinancialCategory = {
    id: 'aaa',
    type: 'expanse',
    title: 'Primeira',
    icon: 'dns',
    color: 'blue',
    inactive: false,
    subcats: {
      id: 'bbb',
      maincat: 'aaa',
      title: 'Primeira Sub',
      budget: 0,
      inactive: false
    }
  };

  zeka2: IFinancialCategory = {
    id: 'ccc',
    type: 'expanse',
    title: 'Segunda',
    icon: 'dns',
    color: 'red',
    inactive: false,
    subcats: {
      id: 'ddd',
      maincat: 'ccc',
      title: 'Segunda Sub',
      budget: 0,
      inactive: false
    }
  };

  zeka3: IFinancialCategory = {
    id: 'eee',
    type: 'income',
    title: 'Terceira',
    icon: 'dns',
    color: 'green',
    inactive: false,
    subcats: {
      id: 'fff',
      maincat: 'eee',
      title: 'Terceira Sub',
      budget: 0,
      inactive: false
    }
  };

  constructor() {
    this.expanseCategories = [this.zeka, this.zeka2]
    this.incomeCategories = [this.zeka3]
  }
}
