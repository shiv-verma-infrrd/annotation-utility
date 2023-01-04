import { Component, OnInit } from '@angular/core';
import { ApiDataService } from '../services/api-data.service'; 
import {faCircleCheck, faCircleXmark} from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {

  batchId:any;
  apiPage:any = [];
  
  imgUrl:any;
  searchText:string='';
  docCheck = faCircleCheck;
  docNotCheck = faCircleXmark;
  constructor(private apiData: ApiDataService) { 
  }


  ngOnInit(): void {
    
    this.imgUrl = this.apiData.URL;
    
    this.apiData.batchData = window.sessionStorage.getItem('global_batch_id')
    // console.log('batch_id: ', this.apiData.batchData)
    this.apiData.get_one_doc(this.apiData.batchData).subscribe((data)=>{
      this.apiData.docarray = data;
      this.apiPage = data; 
      // console.log("apipage****in document page***",data)
    });

    
    // this.batchId = this.apiData.batchData;
    // this.apiData.get_one_doc(this.batchId).subscribe((data)=>{
    //   this.apiDocuments = data; 
    //   for(let i in data){
    

    //     this.apiData.get_pages(data[i]._id).subscribe((d)=>{
          
    //       for(let i in d){
              
    //           this.apiPage.push(d[i]);
            
    //       }
             
    //     });
    //   }
      
      
    // });
    
   
  }

  get_docID(id:any,docName:any){
    this.apiData.docData = id;
    this.apiData.doc_name = docName;
    // console.log("docname",docName)
    window.sessionStorage.setItem('global_doc_name',docName)
    window.sessionStorage.setItem('global_doc_id',id)
  }


  onClear()
  {
    this.searchText = "";
  }

}
