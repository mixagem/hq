import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './content/dashboard/dashboard.component';
import { ExpenseTypesComponent } from './content/settings/expense-types/expense-types.component';
import { SettingsComponent } from './content/settings/settings.component';


// const routes: Routes = [];
const routes: Routes = [{
  path: '', redirectTo: 'dashboard', pathMatch: 'full'
}, {
  path: 'dashboard', component: DashboardComponent, pathMatch: 'full'
}, {
  path: 'settings', component: SettingsComponent, children: [
        {
          path: 'mitypes', component: ExpenseTypesComponent
        }
      ]
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
