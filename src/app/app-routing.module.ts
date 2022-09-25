import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgendaComponent } from './content/agenda/agenda.component';
import { DashboardComponent } from './content/dashboard/dashboard.component';
import { CategoriesComponent } from './content/financial/categories/categories.component';
import { FinancialComponent } from './content/financial/financial.component';

const routes: Routes = [{
  path: '', redirectTo: 'dashboard', pathMatch: 'full'
}, {
  path: 'dashboard', component: DashboardComponent, pathMatch: 'full'
}, {
  path: 'agenda', component: AgendaComponent, pathMatch: 'full'
}, {
  path: 'fi', component: FinancialComponent, children: [
    {
      path: 'cats', component: CategoriesComponent
    }
  ]
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
