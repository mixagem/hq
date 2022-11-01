import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialImportsModule } from './material-imports.module';
import { AgendaComponent } from 'src/app/content/agenda/agenda.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FinancialModule } from './financial.module';


@NgModule({
  declarations: [
    AgendaComponent
  ],
  imports: [
    CommonModule,
    MaterialImportsModule,
    FinancialModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
  ],
  exports:[
    AgendaComponent
  ]
})
export class AppContentModule { }
