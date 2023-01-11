import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { Observable } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';
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

}
