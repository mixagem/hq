import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'field'
})
export class FieldPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'title': return 'Título'
      case 'value': return 'Valor'
      case 'date': return 'Data'
      case 'cat': return 'Categoria'
      case 'subcat': return 'Subcategoria'
      default: return ''
    }
  }

}
