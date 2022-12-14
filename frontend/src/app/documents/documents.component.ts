import { Component, OnInit } from '@angular/core';
import { ApiDataService } from '../services/api-data.service'; 

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
  
  constructor(private apiData: ApiDataService) { 
  }


  ngOnInit(): void {
    
    this.imgUrl = this.apiData.URL;
    
    this.apiData.batchData = localStorage.getItem('global_batch_id')
    this.apiData.get_one_doc(this.apiData.batchData).subscribe((data)=>{
      this.apiPage = data; 
      console.log(data)
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

  get_docID(id:any){
    this.apiData.docData = id;
    localStorage.setItem('global_doc_id',id)
  }


  onClear()
  {
    this.searchText = "";
  }

}
