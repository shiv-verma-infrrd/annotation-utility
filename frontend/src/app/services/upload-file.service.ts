import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {

  baseApiUrl = "http://127.0.0.1:5000/"
  name:any;
  constructor(private http:HttpClient, private tokenStorageService: TokenStorageService) { }

  upload(file:File,batch_name:any,user_id:any){
    const formData = new FormData(); 
    formData.append("zip_file", file);
    formData.append("batch_name", batch_name)
    formData.append("user_id", user_id)
    return this.http.post(this.baseApiUrl+'uploads',formData)
  }
}
