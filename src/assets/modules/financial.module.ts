import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialComponent } from 'src/app/content/financial/financial.component';
import { CategoriesComponent } from 'src/app/content/financial/categories/categories.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { MaterialImportsModule } from './material-imports.module';
import { CategoryDetailsComponent, DeleteCategoryConfirmationModal } from 'src/app/content/financial/categories/category-details/category-details.component';
import { HttpClientModule } from '@angular/common/http';
import { OverviewComponent, OverviewDetailsModal } from 'src/app/content/financial/overview/overview.component';
import { NewCategoryComponent } from 'src/app/content/financial/categories/new-category/new-category.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { TreasuryLogComponent } from 'src/app/content/financial/treasury-log/treasury-log.component';
import { TreasuryDetailsComponent, DeleteTlogConfirmationModal } from 'src/app/content/financial/treasury-log/treasury-details/treasury-details.component';
import { NewTreasuryLogComponent } from 'src/app/content/financial/treasury-log/new-treasury-log/new-treasury-log.component';


@NgModule({
  declarations: [
    FinancialComponent,
    CategoriesComponent,
    CategoryDetailsComponent,
    OverviewComponent,
    NewCategoryComponent,
    DeleteCategoryConfirmationModal,
    TreasuryLogComponent,
    TreasuryDetailsComponent,
    DeleteTlogConfirmationModal,
    NewTreasuryLogComponent,
    OverviewDetailsModal

  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    MaterialImportsModule,
    HttpClientModule,
    ColorPickerModule,
  ],
  exports: [
    FinancialComponent,
    CategoriesComponent,
    CategoryDetailsComponent,
    OverviewComponent,
    DeleteCategoryConfirmationModal,
    TreasuryLogComponent,
    TreasuryDetailsComponent,
    DeleteTlogConfirmationModal,
    NewTreasuryLogComponent,
    OverviewDetailsModal

  ]
})
export class FinancialModule { }
