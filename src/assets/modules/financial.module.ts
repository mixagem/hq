import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialComponent } from 'src/app/content/financial/financial.component';
import { CategoriesComponent } from 'src/app/content/financial/categories/categories.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from 'src/app/app-routing.module';



@NgModule({
  declarations: [
    FinancialComponent,
    CategoriesComponent]
    ,
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule
  ],
  exports: [
    FinancialComponent,
    CategoriesComponent
  ]
})
export class FinancialModule { }
