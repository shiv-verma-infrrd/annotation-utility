import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DocumentsComponent } from './documents/documents.component';
import { EditingPageComponent } from './editing-page/editing-page.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: LoginComponent },
   { path: 'batches', component: DashboardComponent, canActivate : [AuthGuard]},
  { path: 'documents', component: DocumentsComponent, canActivate : [AuthGuard]},
  { path: 'editing-page', component: EditingPageComponent, canActivate : [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
