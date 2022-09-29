import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgendaComponent } from './content/agenda/agenda.component';
import { DashboardComponent } from './content/dashboard/dashboard.component';
import { CategoriesComponent } from './content/financial/categories/categories.component';
import { CategoryDetailsComponent } from './content/financial/categories/category-details/category-details.component';
import { FinancialComponent } from './content/financial/financial.component';
import { OverviewComponent } from './content/financial/overview/overview.component';

const routes: Routes = [{
  path: '', redirectTo: 'dashboard', pathMatch: 'full'
}, {
  path: 'dashboard', component: DashboardComponent, pathMatch: 'full'
}, {
  path: 'agenda', component: AgendaComponent, pathMatch: 'full'
}, {
  path: 'fi', component: FinancialComponent, children: [
    {
      path: 'overview', component: OverviewComponent
    }, {
      path: 'cats', component: CategoriesComponent, children: [{
        path: ':id', component: CategoryDetailsComponent
      }]
    }
  ]
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
