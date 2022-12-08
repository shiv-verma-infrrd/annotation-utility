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

  docs=[
    {name:'doc 1',thumbnail:"../../assets/images/1.jpeg"},
    {name:'doc 2',thumbnail:"../../assets/images/2.jpg"},
    {name:'doc 3',thumbnail:"../../assets/images/3.jpg"},
    {name:'doc 4',thumbnail:"../../assets/images/4.jpg"},
    {name:'doc 5',thumbnail:"../../assets/images/5.jpg"},
    {name:'doc 6',thumbnail:"../../assets/images/6.jpg"},
    {name:'doc 7',thumbnail:"../../assets/images/7.jpg"},
    // {name:'doc 8',thumbnail:"../../assets/images/8.jpg"},
    {name:'doc 9',thumbnail:"../../assets/images/9.jpg"},
    {name:'doc 10',thumbnail:"../../assets/images/10.jpg"},
    {name:'doc 11',thumbnail:"../../assets/images/11.jpg"},
    // {name:'doc 12',thumbnail:"../../assets/images/12.jpg"},
    {name:'doc 13',thumbnail:"../../assets/images/13.jpg"},
    {name:'doc 14',thumbnail:"../../assets/images/14.jpg"},
    {name:'doc 15',thumbnail:"../../assets/images/15.jpg"}
    
  ];
}
