import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DocumentsComponent } from './documents/documents.component';
import { EditingPageComponent } from './editing-page/editing-page.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'batches', component: DashboardComponent },
  { path: 'documents', component: DocumentsComponent },
  { path: 'editing-page', component: EditingPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
