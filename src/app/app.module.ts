import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DocumentsComponent } from './documents/documents.component';
import { FormsModule } from '@angular/forms';
import { formatCurrency } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { EditingPageComponent } from './editing-page/editing-page.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    DocumentsComponent,
    NavbarComponent,
    EditingPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
