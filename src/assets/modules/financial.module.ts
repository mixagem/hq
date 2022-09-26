import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialComponent } from 'src/app/content/financial/financial.component';
import { CategoriesComponent } from 'src/app/content/financial/categories/categories.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { MaterialImportsModule } from './material-imports.module';
import { CategoryDetailsComponent } from 'src/app/content/financial/categories/category-details/category-details.component';



@NgModule({
  declarations: [
    FinancialComponent,
    CategoriesComponent,
    CategoryDetailsComponent]
    ,
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    MaterialImportsModule
  ],
  exports: [
    FinancialComponent,
    CategoriesComponent
  ]
})
export class FinancialModule { }
