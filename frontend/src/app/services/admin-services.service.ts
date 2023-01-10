import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { Observable } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { ApiDataService } from './api-data.service';

@Injectable({
  providedIn: 'root'
})
export class AdminServiceService {
  
  constructor(private http:HttpClient, private tokenStorageService: TokenStorageService, private apiDataService: ApiDataService) { }

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
    

    return this.http.post(this.apiDataService.URL + '/create_user', formData)
  }

  get_user(){
   
    return this.http.get(this.apiDataService.URL+'users')
  }


  delete_user(userId:any){
    userId = "763f78cc-b9a8-474e-99c1-5b8645b01351";
    return this.http.delete(this.apiDataService.URL+'delete_user',);
  }

}
