import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseTypesComponent } from 'src/app/content/settings/expense-types/expense-types.component';
import { MaterialImportsModule } from './material-imports.module';
import { AddNewTypeModalComponent } from 'src/app/content/settings/expense-types/add-new-type-modal/add-new-type-modal.component';


@NgModule({
  declarations: [
    ExpenseTypesComponent,
    AddNewTypeModalComponent
  ],
  imports: [
    CommonModule,
    MaterialImportsModule
  ],
  exports:[
    ExpenseTypesComponent,
    AddNewTypeModalComponent
  ]
})
export class AppContentModule { }
