import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service'; 

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  batchID:any;
  apiBatchdata:any;
  // thumbnail="https://cdn-icons-png.flaticon.com/512/3767/3767084.png";
  thumbnail = "../../assets/dimg.png"
  
  constructor(private apiData:ApiDataService,
    private router: Router,
    private route: ActivatedRoute) { 
     
  }

  ngOnInit(): void {

    this.apiData.batches().subscribe((data)=>{
      this.apiBatchdata = data;
      // console.warn("apiBatchdata",data);
    })

  }

  get_batch_id(id:any){
   this.apiData.batchData = id;
   localStorage.setItem('global_batch_id',id)
   console.log( "this is batch data " + this.apiData.batchData);
   
  }

  onFetchClicked() {
    //  return this.apiData.fetchData();
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation='reload';
    this.router.navigate(['./'],{
      relativeTo:this.route
    })

  }
}
