import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { TokenStorageService } from './token-storage.service';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService extends RootService{
  name:any;
  constructor(private http:HttpClient, private tokenStorageService: TokenStorageService) {
    super()
  }

  upload(file:File,batch_name:any,user_id:any,file_type:any){
    // console.log("service"+user_id)
    
    const formData = new FormData(); 
    formData.append("zip_file", file);
    formData.append("batch_name", batch_name)
    formData.append("user_id", user_id)
    formData.append("document_type",file_type)
    return this.http.post(this.URL+'uploads',formData)
  }
}
