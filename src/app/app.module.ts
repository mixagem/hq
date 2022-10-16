import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavModule } from 'src/assets/modules/nav.module';
import { AppContentModule } from 'src/assets/modules/app-content.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

@NgModule({
  declarations: [
    AppComponent,
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NavModule,
    AppContentModule
  ],

  providers:
    [{ provide: MAT_DATE_LOCALE, useValue: 'pt-PT' }],

  bootstrap: [AppComponent]
})

export class AppModule { }
