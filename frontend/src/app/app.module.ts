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
import { AdminGuard } from './guards/admin.guard';
import { UploadFileComponent } from './upload-file/upload-file.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminNavbarComponent } from './admin-dashboard/admin-navbar/admin-navbar.component';
import { BatchesComponent } from './admin-dashboard/batches/batches.component';
import { UsersComponent } from './admin-dashboard/users/users.component';
import { CreateNewUsersComponent } from './admin-dashboard/create-new-users/create-new-users.component';
import { AssignBatchComponent } from './admin-dashboard/assign-batch/assign-batch.component';
import { AssignTeamComponent } from './admin-dashboard/assign-team/assign-team.component';
import { TeamsComponent } from './admin-dashboard/teams/teams.component';
import { TeamUsersComponent } from './admin-dashboard/team-users/team-users.component';
import { AllocatedBatchesComponent } from './admin-dashboard/allocated-batches/allocated-batches.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    DocumentsComponent,
    NavbarComponent,
    EditingPageComponent,
    LoginComponent,
    UploadFileComponent,
    AdminDashboardComponent,
    AdminNavbarComponent,
    BatchesComponent,
    UsersComponent,
    CreateNewUsersComponent,
    AssignBatchComponent,
    AssignTeamComponent,
    TeamsComponent,
    TeamUsersComponent,
    AllocatedBatchesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    Ng2SearchPipeModule,
    HttpClientModule,
    FontAwesomeModule,
    NgToastModule,
    NgbModule
  ],
  providers: [authInterceptorProviders, AuthGuard, AdminGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
