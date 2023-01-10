import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { Observable } from 'rxjs';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})


export class ApiDataService {
  batchData:any;
  docData:any;
  doc_name:any;
  docarray:any;
  forms:any[]=[];
  checkboxesCoordinate:any[]=[]
  URL = "http://127.0.0.1:5000/";

  constructor(private http:HttpClient, private tokenStorageService: TokenStorageService) {}

  batches(userId: string){
    return this.http.get(this.URL+'/batches/'+userId)
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
    return this.http.put(this.URL+'pages',body, {'headers':headers} );
  
  }

  download_batch(batchId:any,batch_name:any){
    const data = {
      "batchId": batchId,
      "batch_name":batch_name
      
  }    
  
    return this.http.post(this.URL+'downloads',data ,{observe:'response',responseType:"blob"})
  }

  delete_batch_id(batchId:any){
    console.log("batchID : "+batchId)
    const headers = new HttpHeaders({'X-CSRFToken': this.tokenStorageService.getUser().CSRFToken})
    return this.http.delete(this.URL+'batch/'+batchId, {'headers':headers})
  }

  
}

