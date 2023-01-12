import { Component } from '@angular/core';
import { ApiDataService } from '@app/services/api-data.service';
import { TokenStorageService } from '@app/services/token-storage.service';
import { faLaptopHouse } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-assign-batch',
  templateUrl: './assign-batch.component.html',
  styleUrls: ['./assign-batch.component.css']
})
export class AssignBatchComponent {
  selectedBatches : object[] = [];
  // std : object[] = [];
  batchID:any;
  apiBatchdata:any;
  userId:string = '';
  thumbnail = this.apiData.URL + "image/dimg.png"


  constructor(private apiData:ApiDataService,
    private tokenStorage: TokenStorageService){}


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

  
   removeDocument(doc:any){
    
    this.selectedBatches.forEach( (item:any, index:any) => {

      console.log(doc.name === item.name, "ek me true aana ");
      
      

      
      
      // console.log(this.selectedBatches);
      if(item != doc) 
        console.log(item.batchID, "removed id");
        this.selectedBatches.splice(index,1);
    });
    // console.log(this.selectedBatches);
    
 }
  
  
  


   func(e:any,batchID:string,batchname:string){
    const id = e.target.value;
    const ischecked = e.target.checked;
    // console.log(id,ischecked);

    const vari = {batchID,batchname};

    if(e.target.checked == true){
      this.selectedBatches.push(vari)
      console.log(this.selectedBatches);  
    }

    if(e.target.checked == false){

      this.removeDocument(vari);
      console.log(this.selectedBatches);  
      // console.log("jara hai");
      
    }  
   } 
}
