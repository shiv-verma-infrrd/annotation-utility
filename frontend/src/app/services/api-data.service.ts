import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class ApiDataService {
  batchData:any;
  docData:any;
  docarray:any;
  URL = "http://127.0.0.1:80/";

  constructor(private http:HttpClient) {}

  batches(){
    return this.http.get(this.URL+'/batches')
  }

  documents(){
    return this.http.get(this.URL+'/documents')
  }

  get_one_doc(batchId:any):Observable<any>{
    return this.http.get(this.URL+'/pages/'+batchId)
  }


  get_pages(batchId:any,docId:any):Observable<any>{
    return this.http.get(this.URL+'/pages/'+batchId+'/'+docId)

  }

  update_page_data(data:any){
    
    const headers = { 'content-type': 'application/json'}
    const body=JSON.stringify(data);
    return this.http.put(this.URL+'pages',data, {'headers':headers} );
  
  }

  download_batch(batchId:any,batch_name:any){

    const data = {
      "batchId": batchId,
      "batch_name":batch_name
      // "allocatedTo":"sfkdnkw"
  }    
  const headers = { 'content-type': 'application/json'}
    return this.http.post(this.URL+'downloads',data ,{'headers':headers})
  }
  
  
}


// const headers = new Headers({
//   'Authorization': `Bearer ${auth_token}`
// })
// return this.http.get(apiUrl, { headers: headers })
