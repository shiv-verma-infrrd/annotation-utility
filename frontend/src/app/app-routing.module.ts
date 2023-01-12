import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DocumentsComponent } from './documents/documents.component';
import { EditingPageComponent } from './editing-page/editing-page.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { BatchesComponent } from './admin-dashboard/batches/batches.component';
import { UsersComponent } from './admin-dashboard/users/users.component';
import { CreateNewUsersComponent } from './admin-dashboard/create-new-users/create-new-users.component';
import { AssignBatchComponent } from './admin-dashboard/assign-batch/assign-batch.component';
import { AssignTeamComponent } from './admin-dashboard/assign-team/assign-team.component';

const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  { path: 'login', component: LoginComponent },
  { path: 'batches', component: DashboardComponent, canActivate : [AuthGuard]},
  { path: 'documents', component: DocumentsComponent, canActivate : [AuthGuard]},
  { path: 'editing-page', component: EditingPageComponent, canActivate : [AuthGuard]},
  { path: 'admin/create_user', component: CreateNewUsersComponent , canActivate : [AuthGuard]},
  { path: 'admin/assign_batch', component: AssignBatchComponent , canActivate : [AuthGuard]},
  { path: 'admin/assign_team', component: AssignTeamComponent , canActivate : [AuthGuard]},
  { path: 'admin/batches', component: BatchesComponent , canActivate : [AuthGuard]},
  { path: 'admin/users', component: UsersComponent , canActivate : [AuthGuard]},
  { path: 'admin', component: AdminDashboardComponent , canActivate : [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
