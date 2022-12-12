import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class ApiDataService {
  batchData:any;
  docData:any;
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

  update_page_data(){
    // call this api with save and next
    //for frontend team
    //put request with this.http.get(this.URL+'/pages/')
    //put request sample data to send
    // [
    //   {
    //       "_id": "639747bceca0701865a51b7c",
    //       "imgid": 1670858685002,
    //       "batchId": 1,
    //       "documentId": 2,
    //       "batchName": "shiv",
    //       "document_name": "rocks",
    //       "isCorrected": "Booom",
    //       "imageStatus": "shiv",
    //       "imagePath": "shiv",
    //       "kvpData": {
    //           "form": [
    //               {
    //                   "box": [
    //                       72,
    //                       43,
    //                       111,
    //                       59
    //                   ],
    //                   "text": "Shiv",
    //                   "label": "question",
    //                   "words": [
    //                       {
    //                           "text": "booom",
    //                           "box": [
    //                               72,
    //                               43,
    //                               111,
    //                               59
    //                           ]
    //                       }
    //                   ],
    //                   "linking": [
    //                       []
    //                   ],
    //                   "id": 0
    //               },
    //               {
    //                   "box": [
    //                       116,
    //                       45,
    //                       174,
    //                       60
    //                   ],
    //                   "text": "doku",
    //                   "label": "rock",
    //                   "words": [
    //                       {
    //                           "text": "Fengate",
    //                           "box": [
    //                               116,
    //                               45,
    //                               174,
    //                               60
    //                           ]
    //                       }
    //                   ],
    //                   "linking": [
    //                       []
    //                   ],
    //                   "id": 1
    //               }
    //           ]
    //       },
    //       "correctedData": {
    //           "form": []
    //       },
    //       "correctedBy": "",
    //       "correctedOn": ""
  //   //   }
  // ]

  }
}


// const headers = new Headers({
//   'Authorization': `Bearer ${auth_token}`
// })
// return this.http.get(apiUrl, { headers: headers })
