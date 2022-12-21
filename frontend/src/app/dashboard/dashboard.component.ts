import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import {faDownload} from '@fortawesome/free-solid-svg-icons'
import { TokenStorageService } from '../services/token-storage.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  batchID:any;
  apiBatchdata:any;
  userId:string = '';
  // thumbnail="https://cdn-icons-png.flaticon.com/512/3767/3767084.png";
  thumbnail = "../../assets/dimg.png"
  download_icon = faDownload;
  constructor(private apiData:ApiDataService,
    private router: Router,
    private route: ActivatedRoute,
    private tokenStorage: TokenStorageService) { 
     
  }

  ngOnInit(): void {
    this.userId = this.tokenStorage.getUser().userId

    this.apiData.batches(this.userId).subscribe((data)=>{
      this.apiBatchdata = data;
      // console.warn("apiBatchdata",data);
    })

  }

  get_batch_id(id:any){
   this.apiData.batchData = id;
   window.sessionStorage.setItem('global_batch_id',id)
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

  download(batchId:any,batch_name:any){
    console.log("downloading...");
    
    this.apiData.download_batch(batchId,batch_name).subscribe((data)=>{ 
      
      console.log("data");
      
      console.log(data)
      let blob:Blob = data.body as Blob;
      let a = document.createElement('a')
      a.download = batch_name
      a.href = window.URL.createObjectURL(blob)
      a.click();
    
    })
  }
}
