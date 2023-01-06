import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';

import { TokenStorageService } from '../services/token-storage.service';
import {faDownload,faTrash} from '@fortawesome/free-solid-svg-icons'
import { NgToastService } from 'ng-angular-popup';
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
  delete_icon = faTrash;
  delete_batch_Id:any
  delete_batch_name:any
  
  constructor(private apiData:ApiDataService,
    private router: Router,
    private route: ActivatedRoute,
    private tokenStorage: TokenStorageService,
    private toast: NgToastService
    ) { 
     
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
  //  console.log( "this is batch data " + this.apiData.batchData);
   
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
    // console.log("downloading...");
    
    this.apiData.download_batch(batchId,batch_name).subscribe((data)=>{ 
      
      // console.log("data");
      
      console.log(data)
      let blob:Blob = data.body as Blob;
      let a = document.createElement('a')
      a.download = batch_name+'_output'
      a.href = window.URL.createObjectURL(blob)
      a.click();
    
    })

    this.toast.success({ detail: "Success Message", summary: " file Downloaded Successfully", duration: 3000 })
  }

  displayStyle = "none";

  openPopup(bId:any, bName:any) {
    this.delete_batch_Id = bId
    this.delete_batch_name = bName
    this.displayStyle = "block";
  }
  closePopup() {
    this.displayStyle = "none";
  }

  delete_batch(id:any){

    // console.log("batchid :"+id)
    this.apiData.delete_batch_id(id).subscribe((data)=>{ 
             console.log(data)
    })
  
    this.closePopup()
    this.onFetchClicked()
    this.toast.success({ detail: "Success Message", summary: this.delete_batch_name+" Deleted Successfully", duration: 3000 })


  }
}
