import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { TokenStorageService } from './token-storage.service';
import { ApiDataService } from './api-data.service';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {
  name:any;
  constructor(private http:HttpClient, private tokenStorageService: TokenStorageService, private apiDataService:  ApiDataService) { }

  upload(file:File,batch_name:any,user_id:any){
    // console.log("service"+user_id)
    
    const formData = new FormData(); 
    formData.append("zip_file", file);
    formData.append("batch_name", batch_name)
    formData.append("user_id", user_id)
    return this.http.post(this.apiDataService.URL+'uploads',formData)
  }
}
