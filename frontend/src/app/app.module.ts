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
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import {HttpClientModule} from '@angular/common/http'
import { LoginComponent } from './login/login.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { authInterceptorProviders } from './helpers/auth.interceptor';
import { NgToastModule } from 'ng-angular-popup';
import { AuthGuard } from './guards/auth.guard';
import { UploadFileComponent } from './upload-file/upload-file.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    DocumentsComponent,
    NavbarComponent,
    EditingPageComponent,
    LoginComponent,
    UploadFileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    Ng2SearchPipeModule,
    HttpClientModule,
    FontAwesomeModule,
    NgToastModule
  ],
  providers: [authInterceptorProviders, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
