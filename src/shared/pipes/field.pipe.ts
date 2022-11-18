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
      case 'type': return 'Tipo'
      case 'cat': return 'Categoria'
      case 'subcat': return 'Subcategoria'
      case 'nif': return 'Tem contribuinte'
      case 'efat': return 'Categoria E-fatura'
      case 'efatcheck': return 'Fatura verificada'
      case 'recurrencyid': return 'Movimento recorrente'
      default: return ''
    }
  }

}
