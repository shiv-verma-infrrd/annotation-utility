import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {

  baseApiUrl = "http://127.0.0.1:80/"
  name:any;
  constructor(private http:HttpClient) { }

  upload(file:File,batch_name:any,user_id:any){
    // console.log("service"+user_id)
    const formData = new FormData(); 
    formData.append("file", file);
    formData.append("batch_name", batch_name)
    formData.append("user_id", user_id)
    return this.http.post(this.baseApiUrl+'uploads',formData)
  }
}
