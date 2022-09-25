import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from 'src/app/content/settings/settings.component';
import { AppRoutingModule } from 'src/app/app-routing.module';



@NgModule({
  declarations: [
    SettingsComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule
  ],
  exports: [
    SettingsComponent
  ]
})
export class SettingsModule { }
