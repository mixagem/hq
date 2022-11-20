import { Pipe, PipeTransform } from '@angular/core';
import { CategoriesService } from 'src/app/content/financial/categories/categories.service';
import { EfaturaService } from 'src/app/content/financial/efatura/efatura.service';

@Pipe({
  name: 'tlogsearchvalue'
})
export class TlogsearchvaluePipe implements PipeTransform {

  constructor(private catService: CategoriesService, private efatService: EfaturaService) { }

  transform(value: string | boolean, type: string):string | Date {


    switch (type) {
      case 'title': case 'value': return value.toString();
      case 'date': return new Date(Number(value))
      case 'type': return value === 'expense' ? 'Despesa' : 'Rendimento'
      case 'cat': return this.catService.catTable[`'${Number(value)}'`].title;
      case 'subcat': return this.catService.subcatTable[`'${Number(value)}'`].title;
      case 'nif': case 'efatcheck': case 'recurrencyid': return value === true ? 'check_box' : 'check_box_outline_blank'
      case 'efat': return this.efatService.efaturaTable[Number(value)].title;
      default: return ''
    }

  }
}
