import { Component, ViewChild } from '@angular/core';
import { ApiDataService } from '@app/services/api-data.service';
import { TokenStorageService } from '@app/services/token-storage.service';
import { faLaptopHouse } from '@fortawesome/free-solid-svg-icons';
import { AdminServiceService } from '@app/services/admin-services.service';
import { NgToastService } from 'ng-angular-popup';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-assign-batch',
  templateUrl: './assign-batch.component.html',
  styleUrls: ['./assign-batch.component.css']
})
export class AssignBatchComponent {
  selectedBatches: any = [];
  batchID: any;
  apiBatchdata: any;
  userId: string = '';
  thumbnail = this.apiData.URL + "image/dimg.png"
  new_team= false;
  teamData:any
  selectedUsers: any = [];
  teams:any

  users: any = [];

  constructor(private apiData: ApiDataService,
    private tokenStorage: TokenStorageService,private admin_service: AdminServiceService,
    private toast: NgToastService) { }


  ngOnInit(): void {
    this.userId = this.tokenStorage.getUser().userId

    this.apiData.batches(this.userId).subscribe((data) => {
      this.apiBatchdata = data;
      // console.warn("apiBatchdata",data);
    })

    this.admin_service.get_team().subscribe((data:any) => {
      for(let i=0 ; i < data.length ; i++){
        this.teams = data
      }
      console.warn("teams***", data);
    })

    this.admin_service.get_user().subscribe((data:any) => {
      for(let i=0 ; i < data.length ; i++){
        if(data[i].role != 'admin'){
          this.users.push(data[i]);
        }
        
      }
      console.warn("users", data);
    })

    

  }

  get_batch_id(id: any) {
    this.apiData.batchData = id;
    window.sessionStorage.setItem('global_batch_id', id)
    //  console.log( "this is batch data " + this.apiData.batchData); 
  }


  removeDocument(doc: any) {

    // let btches : any = this.selectedBatches;

    for(let i=0;i<this.selectedBatches.length;i++){
      if(doc.batchID == this.selectedBatches[i].batchID){
        this.selectedBatches.splice(i, 1);
        break;
      }
      
    }

 
  }

  func(e: any, batchID: string, batchname: string) {
    const id = e.target.value;
    const ischecked = e.target.checked;
    // console.log(id,ischecked);

    const vari = { batchID, batchname };

    if (e.target.checked == true) {
      this.selectedBatches.push(vari)
      console.log(this.selectedBatches);
    }

    if (e.target.checked == false) {

      this.removeDocument(vari);
      console.log(this.selectedBatches);
      // console.log("jara hai");

    }
  }
  printname(name:any){
    this.teamData = name.value.split(',');
    // const team_id = name.innerHTML
    // console.log(this.new_team_name.nativeElement.value)
    
  }
  
  togglenewteam(){
    this.new_team = !this.new_team;
  }

  addToTeam() {
    const team_name = this.teamData[1]
    const team_id = this.teamData[0]
    console.log(this.teamData)
    // console.log(team_name,this.selectedUsers);
    this.admin_service.assign_batch_to_team(team_id,team_name,this.selectedBatches).subscribe((data) => {
      console.log(data);
    })
   

  }

  @ViewChild('te') new_team_name: any;

  addTonewTeam(){

    // const team_name = this.new_team_name.nativeElement.value
    // console.log(team_name,this.selectedUsers);
    const user_name = this.teamData[1]
    const user_id = this.teamData[0]
    console.log(this.teamData)
    this.admin_service.assign_batch_to_user(user_id,user_name,this.selectedBatches).subscribe((data) => {
      console.log(data);
    })

  }

}
