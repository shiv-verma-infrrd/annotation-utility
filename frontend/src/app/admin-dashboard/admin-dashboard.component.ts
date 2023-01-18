import { Component } from '@angular/core';
import { AdminServiceService } from '../services/admin-services.service';
import { ApiDataService } from '@app/services/api-data.service';
import { NgToastService } from 'ng-angular-popup';
import { faFolder,faFolderOpen,faFileArchive} from '@fortawesome/free-regular-svg-icons';


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {

  total_batches:number=0;
  total_document:number=0;
  total_corrected_batches:number = 0;
  total_not_corrected_batches:number =0;
  total_no_of_teams:number=0;
  total_users:number=0;

  percentC:any=0;
  percentNC:any=0;

  Batches:any = [];
  teams:any=[];
  users:any=[];

  folder = faFolder;
  docs = faFolderOpen;
  batch = faFileArchive;
  notcorrect = faFolder;



  constructor(private admin_service:AdminServiceService,
    private api_data_service:ApiDataService,
    private toast: NgToastService){}

   ngOnInit():any{

    this.admin_service.get_user().subscribe((data)=>{
      this.users = data;
      this.total_users = this.users.length;
      console.warn("users",data);
    })

    this.admin_service.get_team().subscribe((data)=>{
      this.teams = data;
      for(let i = 0;i<this.teams.length;i++){
        this.total_no_of_teams++;
      }
      // console.warn("teams ",data);
    });

    this.api_data_service.batches("123").subscribe(data=>{
      this.Batches = data

      for(let i = 0;i<this.Batches.length;i++){
        this.api_data_service.get_one_doc(this.Batches[i].batchId).subscribe(docdata=>{
          for(let j=0;j<docdata.length;j++){
            if(docdata[j].isCorrected == 'False') this.total_not_corrected_batches++;
            else  this.total_corrected_batches++;
            
          }
          // console.log(docdata);
          
        })
        this.total_document += this.Batches[i].documentCount;
        this.total_batches++;

      }
      // console.log(data)
      
      console.log(this.total_document);
  
    });

    let ass:number = ((this.total_corrected_batches / this.total_document)*100)
    this.percentC = ass.toFixed(2)
    
   }

}
