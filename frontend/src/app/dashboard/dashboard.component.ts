import { Component, OnInit } from '@angular/core';
import { ApiDataService } from '../services/api-data.service'; 

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  batchID:any;
  apiBatchdata:any;
  thumbnail="https://cdn-icons-png.flaticon.com/512/3767/3767084.png";
  constructor(private apiData:ApiDataService) { 

     apiData.batches().subscribe((data)=>{
      this.apiBatchdata = data;
      console.warn("apiBatchdata",data);
    })
     
  }

  ngOnInit(): void {

  }

  get_batch_id(id:any){
   this.apiData.batchData = id;

   console.log( "this is batch data " + this.apiData.batchData);
   
  }
}
