import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyViewComponent } from './monthly-view/monthly-view.component';
import { AnualViewComponent } from './anual-view/anual-view.component';
import { DecadeViewComponent } from './decade-view/decade-view.component';
import { MaterialImportsModule } from 'src/assets/modules/material-imports.module';

@NgModule({
  declarations: [
    MonthlyViewComponent,
    AnualViewComponent,
    DecadeViewComponent,],
  imports: [
    CommonModule,
    MaterialImportsModule
  ],
  exports: [
    MonthlyViewComponent,
    AnualViewComponent,
    DecadeViewComponent,
  ]
})
export class GridViewModule { }
