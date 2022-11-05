import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from 'src/app/nav/navbar/navbar.component';
import { NavmenuComponent } from 'src/app/nav/navmenu/navmenu.component';
import { MaterialImportsModule } from './material-imports.module';
import { TreasurySearchboxComponent } from 'src/app/nav/navbar/treasury-searchbox/treasury-searchbox.component';



@NgModule({
  declarations: [
    NavbarComponent,
    NavmenuComponent,
    TreasurySearchboxComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MaterialImportsModule
  ],
  exports: [
    NavbarComponent,
    NavmenuComponent,
    TreasurySearchboxComponent
  ]
})
export class NavModule { }
