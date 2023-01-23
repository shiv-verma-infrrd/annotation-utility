import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DocumentsComponent } from './documents/documents.component';
import { EditingPageComponent } from './editing-page/editing-page.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { BatchesComponent } from './admin-dashboard/batches/batches.component';
import { UsersComponent } from './admin-dashboard/users/users.component';
import { CreateNewUsersComponent } from './admin-dashboard/create-new-users/create-new-users.component';
import { AssignBatchComponent } from './admin-dashboard/assign-batch/assign-batch.component';
import { AssignTeamComponent } from './admin-dashboard/assign-team/assign-team.component';
import { TeamsComponent } from './admin-dashboard/teams/teams.component';
import { TeamUsersComponent } from './admin-dashboard/team-users/team-users.component';
import { AllocatedBatchesComponent } from './admin-dashboard/allocated-batches/allocated-batches.component';

const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  { path: 'login', component: LoginComponent },
  { path: 'batches', component: DashboardComponent, canActivate : [AuthGuard]},
  { path: 'documents', component: DocumentsComponent, canActivate : [AuthGuard]},
  { path: 'editing-page', component: EditingPageComponent, canActivate : [AuthGuard]},
  { path: 'admin/create_user', component: CreateNewUsersComponent , canActivate : [AuthGuard, AdminGuard]},
  { path: 'admin/assign_batch', component: AssignBatchComponent , canActivate : [AuthGuard, AdminGuard]},
  { path: 'admin/assign_team', component: AssignTeamComponent , canActivate : [AuthGuard, AdminGuard]},
  { path: 'admin/batches/allocated', component: AllocatedBatchesComponent , canActivate : [AuthGuard, AdminGuard]},
  { path: 'admin/batches', component: BatchesComponent , canActivate : [AuthGuard, AdminGuard]},
  { path: 'admin/users', component: UsersComponent , canActivate : [AuthGuard, AdminGuard]},
  { path: 'admin/teams', component: TeamsComponent , canActivate : [AuthGuard, AdminGuard]},
  { path: 'admin/teams/users', component: TeamUsersComponent , canActivate : [AuthGuard, AdminGuard]},
  { path: 'admin', component: AdminDashboardComponent , canActivate : [AuthGuard, AdminGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
