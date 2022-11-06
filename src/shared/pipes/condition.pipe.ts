import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'condition'
})
export class ConditionPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case '&&': return 'Contém'
      case '=': return 'Igual a'
      case '<': return 'Menor'
      case '<=': return 'Menor ou igual'
      case '>': return 'Maior'
      case '>=': return 'Maior ou igual'
      case '!=': return 'Diferente de'
      default: return ''
    }
  }

}
