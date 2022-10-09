import { Pipe, PipeTransform } from '@angular/core';
import { ITreasuryLog } from '../interfaces/itreasury-log';

@Pipe({
  name: 'guita'
})
export class GuitaPipe implements PipeTransform {

  transform(treasuryLog: ITreasuryLog, wantNegativeIndicator: Boolean = false): string {

    // por defeito, o pipe não retorna o hifen
    let negativeIndicator = '';
    // retorna hifen caso indicado, caso seja despesa, e caso o vajor não seja 0
    if (wantNegativeIndicator && treasuryLog.type === 'expense' && treasuryLog.value !== 0) { negativeIndicator = '- ' };

    // dividir o número no separador decimal
    let transformedValue = treasuryLog.value.toString().split('.');

    // caso não exista parte decimal, default = .00
    if (transformedValue[1] === undefined) { transformedValue[1] = '00'; }

    // caso exista parte decimal, mas só tenha 1 número (por exemplo 23,3€)
    if (transformedValue[1].length === 1) { transformedValue[1] = transformedValue[1] + '0'; }

    return negativeIndicator + transformedValue[0] + ',' + transformedValue[1] + ' €';

  }

}
