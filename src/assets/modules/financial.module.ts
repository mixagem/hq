import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialComponent } from 'src/app/content/financial/financial.component';
import { CategoriesComponent } from 'src/app/content/financial/categories/categories.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { MaterialImportsModule } from './material-imports.module';
import { CategoryDetailsComponent } from 'src/app/content/financial/categories/category-details/category-details.component';
import { HttpClientModule } from '@angular/common/http';
import { OverviewComponent } from 'src/app/content/financial/overview/overview.component';
import { NewCategoryComponent } from 'src/app/content/financial/categories/new-category/new-category.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { TreasuryLogComponent } from 'src/app/content/financial/treasury-log/treasury-log.component';
import { TreasuryDetailsComponent, DeleteTreasuryLogConfirmationModal } from 'src/app/content/financial/treasury-log/treasury-details/treasury-details.component';
import { NewTreasuryLogComponent } from 'src/app/content/financial/treasury-log/new-treasury-log/new-treasury-log.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { GuitaPipe } from '../pipes/guita.pipe';
import { MissingCategoriesSnackBarComponent } from 'src/app/content/financial/treasury-log/missing-categories-snack-bar/missing-categories-snack-bar.component';
import { OverviewDailyDetailsModalComponent } from 'src/app/content/financial/overview/overview-daily-details-modal/overview-daily-details-modal.component';
import { DeleteCategoryConfirmationModalComponent } from 'src/app/content/financial/categories/category-details/delete-category-confirmation-modal/delete-category-confirmation-modal.component';
import { MhqSucessSnackBarComponent } from '../components/mhq-sucess-snack-bar/mhq-sucess-snack-bar.component';
import { MhqFailureSnackBarComponent } from '../components/mhq-failure-snack-bar/mhq-failure-snack-bar.component';

@NgModule({
  declarations: [
    FinancialComponent,
    CategoriesComponent,
    CategoryDetailsComponent,
    OverviewComponent,
    NewCategoryComponent,
    TreasuryLogComponent,
    TreasuryDetailsComponent,
    DeleteTreasuryLogConfirmationModal,
    NewTreasuryLogComponent,
    GuitaPipe,
    MissingCategoriesSnackBarComponent,
    OverviewDailyDetailsModalComponent,
    DeleteCategoryConfirmationModalComponent,
    MhqSucessSnackBarComponent,
    MhqFailureSnackBarComponent

  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    MaterialImportsModule,
    HttpClientModule,
    ColorPickerModule,
    NgScrollbarModule
  ],
  exports: [
    FinancialComponent,
    CategoriesComponent,
    CategoryDetailsComponent,
    OverviewComponent,
    TreasuryLogComponent,
    TreasuryDetailsComponent,
    DeleteTreasuryLogConfirmationModal,
    NewTreasuryLogComponent,
    GuitaPipe,
    MissingCategoriesSnackBarComponent,
    OverviewDailyDetailsModalComponent,
    DeleteCategoryConfirmationModalComponent,
    MhqSucessSnackBarComponent,
    MhqFailureSnackBarComponent

  ]
})
export class FinancialModule { }
