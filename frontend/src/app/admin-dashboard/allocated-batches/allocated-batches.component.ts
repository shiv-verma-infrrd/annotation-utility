import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminServiceService } from '@app/services/admin-services.service';
import { ApiDataService } from '@app/services/api-data.service';
import { RootService } from '@app/services/root.service';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-allocated-batches',
  templateUrl: './allocated-batches.component.html',
  styleUrls: ['./allocated-batches.component.css']
})
export class AllocatedBatchesComponent {


  team:any = []
  users:any = []

  constructor(private admin_service:AdminServiceService, private router: Router, private route: ActivatedRoute, private toast: NgToastService, private root:RootService,private apiData:ApiDataService){}

  ngOnInit(): void {
   
    this.apiData.batchData = window.sessionStorage.getItem('global_batch_id');
    this.admin_service.fetch_one_batch(this.apiData.batchData ).subscribe((data:any)=>{
      this.team = data[0].allocatedToTeams;
      this.users = data[0].allocatedToUsers;
      console.log("users ",data);
    })

  

  }

  delete_user(id:any){

    for (let i = 0; i < this.users.length; i++) {
      if (id == this.users[i].user_id) {
        this.users.splice(i, 1);
        break;
      }
    }
  }

  delete_team(id:any){

    for (let i = 0; i < this.team.length; i++) {
      if (id == this.team[i].team_id) {
        this.team.splice(i, 1);
        break;
      }
    }
  }

save_data_team(){
  this.apiData.batchData = window.sessionStorage.getItem('global_batch_id');
  this.admin_service.delete_batch_team(this.apiData.batchData,this.team).subscribe((data) => {
    console.log(data);
  })

  this.toast.success({ detail: "Success Message", summary: "Team members updated successfully", duration: 3000 })

}

save_data_user(){

  this.apiData.batchData = window.sessionStorage.getItem('global_batch_id');
  this.admin_service.delete_batch_user(this.apiData.batchData,this.users).subscribe((data) => {
    console.log(data);
  })

  this.toast.success({ detail: "Success Message", summary: "members updated successfully", duration: 3000 })

}

}
