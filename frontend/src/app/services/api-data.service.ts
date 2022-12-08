import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class ApiDataService {
  batchData:any;
  
  URL = "http://127.0.0.1:80/";

  constructor(private http:HttpClient) {}

  batches(){
    return this.http.get(this.URL+'/batches')
  }

  documents(){
    return this.http.get(this.URL+'/documents')
  }

  get_one_doc(batchId:any):Observable<any>{
    return this.http.get(this.URL+'/documents/'+batchId)
  }

  get_ocr_data(data:any){
    return this.http.get(this.URL+'/ocrDataKvp/'+data)
  }
}


// const headers = new Headers({
//   'Authorization': `Bearer ${auth_token}`
// })
// return this.http.get(apiUrl, { headers: headers })