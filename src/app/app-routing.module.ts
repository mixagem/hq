import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgendaComponent } from './content/agenda/agenda.component';
import { DashboardComponent } from './content/dashboard/dashboard.component';
import { BudgetDetailsComponent } from './content/financial/budgeting/budget-details/budget-details.component';
import { BudgetingComponent } from './content/financial/budgeting/budgeting.component';
import { NewBudgetComponent } from './content/financial/budgeting/new-budget/new-budget.component';
import { CategoriesComponent } from './content/financial/categories/categories.component';
import { CategoryDetailsComponent } from './content/financial/categories/category-details/category-details.component';
import { NewCategoryComponent } from './content/financial/categories/new-category/new-category.component';
import { FinancialComponent } from './content/financial/financial.component';
import { AnualViewComponent } from './content/financial/grid-view/anual-view/anual-view.component';
import { DecadeViewComponent } from './content/financial/grid-view/decade-view/decade-view.component';
import { GridViewComponent } from './content/financial/grid-view/grid-view.component';
import { MonthlyViewComponent } from './content/financial/grid-view/monthly-view/monthly-view.component';
import { AnalysisComponent } from './content/financial/analysis/analysis.component';
import { NewTreasuryLogComponent } from './content/financial/treasury-log/new-treasury-log/new-treasury-log.component';
import { TreasuryDetailsComponent } from './content/financial/treasury-log/treasury-details/treasury-details.component';
import { TreasuryLogComponent } from './content/financial/treasury-log/treasury-log.component';
import { EfaturaComponent } from './content/financial/efatura/efatura.component';

const ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, pathMatch: 'full' },
  { path: 'agenda', component: AgendaComponent, pathMatch: 'full' },
  {
    path: 'fi', component: FinancialComponent, children: [
      {
        path: 'grid', component: GridViewComponent, children: [
          { path: 'month', component: MonthlyViewComponent },
          { path: 'anual', component: AnualViewComponent },
          { path: 'decade', component: DecadeViewComponent }
        ]
      }, {
        path: 'tlogs', component: TreasuryLogComponent, children: [
          { path: 'add', component: NewTreasuryLogComponent },
          { path: ':id', component: TreasuryDetailsComponent }
        ]
      }, {
        path: 'cats', component: CategoriesComponent, children: [
          { path: 'add', component: NewCategoryComponent },
          { path: ':id', component: CategoryDetailsComponent }]
      }, {
        path: 'budget', component: BudgetingComponent, children: [
          { path: 'add', component: NewBudgetComponent },
          { path: ':id', component: BudgetDetailsComponent }
        ]
      }, {
        path: 'graphs', component: AnalysisComponent
      }, {
        path: 'efat', component: EfaturaComponent
      }
    ]
  }];

@NgModule({
  imports: [RouterModule.forRoot(ROUTES)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
