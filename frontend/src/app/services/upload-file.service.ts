import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {

  baseApiUrl = "http://127.0.0.1:80/"
  name:any;
  constructor(private http:HttpClient) { }

  upload(file:File,batch_name:any){
    const formData = new FormData(); 
    formData.append("file", file);
    formData.append("batch_name", batch_name)
    return this.http.post(this.baseApiUrl+'uploads',formData)
  }
}
