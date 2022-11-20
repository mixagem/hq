import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialComponent } from 'src/app/content/financial/financial.component';
import { CategoriesComponent } from 'src/app/content/financial/categories/categories.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { MaterialImportsModule } from './material-imports.module';
import { CategoryDetailsComponent } from 'src/app/content/financial/categories/category-details/category-details.component';
import { HttpClientModule } from '@angular/common/http';
import { NewCategoryComponent } from 'src/app/content/financial/categories/new-category/new-category.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { TreasuryLogComponent } from 'src/app/content/financial/treasury-log/treasury-log.component';
import { TreasuryDetailsComponent } from 'src/app/content/financial/treasury-log/treasury-details/treasury-details.component';
import { NewTreasuryLogComponent } from 'src/app/content/financial/treasury-log/new-treasury-log/new-treasury-log.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { GuitaPipe } from '../pipes/guita.pipe';
import { OverviewDailyDetailsModalComponent } from 'src/app/content/financial/grid-view/monthly-view/overview-daily-details-modal/overview-daily-details-modal.component';
import { DeleteCategoryConfirmationModalComponent } from 'src/app/content/financial/categories/category-details/delete-category-confirmation-modal/delete-category-confirmation-modal.component';
import { GridViewComponent } from 'src/app/content/financial/grid-view/grid-view.component';
import { GridViewModule } from 'src/app/content/financial/grid-view/grid-view.module';
import { ReorderCategoriesModalComponent } from 'src/app/content/financial/categories/reorder-categories-modal/reorder-categories-modal.component';
import { BudgetDetailsComponent } from 'src/app/content/financial/budgeting/budget-details/budget-details.component';
import { NewBudgetComponent } from 'src/app/content/financial/budgeting/new-budget/new-budget.component';
import { BudgetingComponent } from 'src/app/content/financial/budgeting/budgeting.component';
import { AnalysisComponent } from 'src/app/content/financial/analysis/analysis.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DeleteTreasauryLogModalComponent } from 'src/app/content/financial/treasury-log/treasury-details/delete-treasaury-log-modal/delete-treasaury-log-modal.component';
import { DettachRecurrencyModalComponent } from 'src/app/content/financial/treasury-log/treasury-details/dettach-recurrency-modal/dettach-recurrency-modal.component';
import { UpdateRecurrencyModalComponent } from 'src/app/content/financial/treasury-log/treasury-details/update-recurrency-modal/update-recurrency-modal.component';
import { EfaturaComponent } from 'src/app/content/financial/efatura/efatura.component';
import { CheckTreasuryEfatComponent } from 'src/app/content/financial/treasury-log/treasury-details/check-treasury-efat/check-treasury-efat.component';
import { MhqSnackBarComponent } from 'src/shared/components/mhq-snack-bar/mhq-snack-bar.component';
import { EFatSelectorModalComponent } from 'src/app/content/financial/efatura/e-fat-selector-modal/e-fat-selector-modal.component';
import { GraphConfigModalComponent } from 'src/app/content/financial/analysis/graph-config-modal/graph-config-modal.component';


@NgModule({
  declarations: [
    FinancialComponent,
    CategoriesComponent,
    CategoryDetailsComponent,
    NewCategoryComponent,
    TreasuryLogComponent,
    TreasuryDetailsComponent,
    NewTreasuryLogComponent,
    GuitaPipe,
    OverviewDailyDetailsModalComponent,
    DeleteCategoryConfirmationModalComponent,
    ReorderCategoriesModalComponent,
    GridViewComponent,
    MhqSnackBarComponent,
    NewBudgetComponent,
    BudgetDetailsComponent,
    BudgetingComponent,
    AnalysisComponent,
    DeleteTreasauryLogModalComponent,
    DettachRecurrencyModalComponent,
    UpdateRecurrencyModalComponent,
    EfaturaComponent,
    CheckTreasuryEfatComponent,
    EFatSelectorModalComponent,
    GraphConfigModalComponent

  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    MaterialImportsModule,
    HttpClientModule,
    ColorPickerModule,
    NgScrollbarModule,
    GridViewModule,
    NgxChartsModule,
    BrowserAnimationsModule
  ],
  exports: [
    FinancialComponent,
    CategoriesComponent,
    CategoryDetailsComponent,
    TreasuryLogComponent,
    TreasuryDetailsComponent,
    NewTreasuryLogComponent,
    GuitaPipe,
    OverviewDailyDetailsModalComponent,
    DeleteCategoryConfirmationModalComponent,
    ReorderCategoriesModalComponent,
    MhqSnackBarComponent,
    GridViewComponent,
    NewBudgetComponent,
    BudgetDetailsComponent,
    BudgetingComponent,
    AnalysisComponent,
    DeleteTreasauryLogModalComponent,
    DettachRecurrencyModalComponent,
    UpdateRecurrencyModalComponent,
    EfaturaComponent,
    CheckTreasuryEfatComponent,
    EFatSelectorModalComponent,
    GraphConfigModalComponent

  ]
})
export class FinancialModule { }
