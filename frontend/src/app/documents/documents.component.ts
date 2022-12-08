import { Component, OnInit } from '@angular/core';
import { ApiDataService } from '../services/api-data.service'; 

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {

  batchId:any;

  apiDocuments:any;
  
  constructor(private apiData: ApiDataService) { 
  }


  ngOnInit(): void {
    
    this.batchId = this.apiData.batchData;
    this.apiData.get_one_doc(this.batchId).subscribe((data)=>{
      this.apiDocuments = data[0].documentList; 
    });
  }

  searchText:string='';
}
