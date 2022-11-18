import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from 'src/app/nav/navbar/navbar.component';
import { NavmenuComponent } from 'src/app/nav/navmenu/navmenu.component';
import { MaterialImportsModule } from './material-imports.module';
import { TreasurySearchboxComponent } from 'src/app/nav/navbar/treasury-searchbox/treasury-searchbox.component';
import { AdvancedTreasurySearchComponent } from 'src/app/nav/navbar/treasury-searchbox/advanced-treasury-search/advanced-treasury-search.component';
import { ConditionPipe } from '../pipes/condition.pipe';
import { FieldPipe } from '../pipes/field.pipe';
import { DeleteSearchModalComponent } from 'src/app/nav/navbar/treasury-searchbox/advanced-treasury-search/delete-search-modal/delete-search-modal.component';
import { TlogsearchvaluePipe } from '../pipes/tlogsearchvalue.pipe';



@NgModule({
  declarations: [
    NavbarComponent,
    NavmenuComponent,
    TreasurySearchboxComponent,
    AdvancedTreasurySearchComponent,
    DeleteSearchModalComponent,
    ConditionPipe,
    FieldPipe,
    TlogsearchvaluePipe,
  ],
  imports: [
    CommonModule,
    RouterModule,
    MaterialImportsModule
  ],
  exports: [
    NavbarComponent,
    NavmenuComponent,
    TreasurySearchboxComponent,
    AdvancedTreasurySearchComponent,
    DeleteSearchModalComponent
  ]
})
export class NavModule { }
