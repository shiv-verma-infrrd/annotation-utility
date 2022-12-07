import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})


export class ApiDataService {
  URL = "http://127.0.0.1:80/";

  constructor(private http:HttpClient) {}

  batches(){
    return this.http.get(this.URL+'/batches')
  }

  documents(){
    return this.http.get(this.URL+'/documents')
  }

  get_one_doc(batchId:any){
    return this.http.get(this.URL+'/documents/'+batchId)
  }
}


// const headers = new Headers({
//   'Authorization': `Bearer ${auth_token}`
// })
// return this.http.get(apiUrl, { headers: headers })
