import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { Observable } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class AdminServiceService extends RootService{
  
  constructor(private http:HttpClient, private tokenStorageService: TokenStorageService) {
    super()
  }

  create_user(name:any,username:any,email:any,password:any,role:any): Observable<any> {
  
    // const httpHeaders = {
    //   headers: new HttpHeaders({ 'Content-Type': 'multipart/form-data'})
    // };

    

    const formData = new FormData(); 
    formData.append("name", name);
    formData.append("user_name", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);

    console.log(formData);
    

    return this.http.post(this.URL + '/create_user', formData)
  }

  get_user(){
   
    return this.http.get(this.URL+'users')
  }


  delete_user(userId:any){
    return this.http.delete(this.URL+'delete_user/'+userId);
  }

  create_team(team:string , users:any){
    let data =
    {
      "team_name":team,
      "users":users
  }
    return this.http.post(this.URL+'create_team',data)
  }

  get_team(){
    return this.http.get(this.URL+'teams')
  }

  delete_team(teamId:any){

    return this.http.delete(this.URL+'delete_teams/'+teamId);

  }
  add_to_team(team_id:any,team_name:any,users:any){

    let data =
    {
      "team_id":team_id,
      "team_name":team_name,
      "users":users
  }
  console.log(data)
    return this.http.put(this.URL+'create_team',data)

  }
  get_one_team(id:any){

    return this.http.get(this.URL+'team/'+id)

  }

  delete_team_members(team_id:any,users:any){

    let data =
    {
      "team_id":team_id,
      "users":users
  }
    return this.http.put(this.URL+'delete-team-members',data)


  }

  assign_batch_to_team(team_id:any,team_name:any,batches:any){

    let data =
    {
      "team_id":team_id,
      "team_name":team_name,
      "batches":batches
   }
  console.log(data)
    return this.http.post(this.URL+'assign_batch',data)

  }

  assign_batch_to_user(team_id:any,team_name:any,batches:any){

    let data =
    {
      "user_id":team_id,
      "user_name":team_name,
      "batches":batches
   }
   
  console.log(data)
    return this.http.post(this.URL+'assign-batchs-users',data)

  }

  fetch_one_batch(id:any){
    return this.http.get(this.URL+'batches-data/'+id)
  }

  delete_batch_user(batchId:any,allocatedToUsers:any){

    let data =
    {
      "batchId":batchId,
      "allocatedToUsers":allocatedToUsers
  }
    return this.http.put(this.URL+'delete-batch-user',data)


  }

  
  delete_batch_team(batchId:any,allocatedToTeam:any){

    let data =
    {
      "batchId":batchId,
      "allocatedToTeams":allocatedToTeam
  }
    return this.http.put(this.URL+'delete-batch-team',data)


  }

}


