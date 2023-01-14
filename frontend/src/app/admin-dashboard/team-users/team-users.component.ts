import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminServiceService } from '@app/services/admin-services.service';
import { RootService } from '@app/services/root.service';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-team-users',
  templateUrl: './team-users.component.html',
  styleUrls: ['./team-users.component.css']
})
export class TeamUsersComponent {
  constructor(private admin_service:AdminServiceService, private router: Router, private route: ActivatedRoute, private toast: NgToastService, private root:RootService){}

  team:any = []
  users:any = []
  ngOnInit(): void {
    // this.userId = this.tokenStorage.getUser().userId

    let accessteamtokken:any = window.sessionStorage.getItem('auth-team')
    const decodedData = atob(accessteamtokken);

    this.root.TEAM_ID = decodedData;

    this.admin_service.get_one_team(this.root.TEAM_ID).subscribe((data:any)=>{
      this.team = data;
      this.users = data[0].users
      console.warn("users ",this.users);
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

save_data(){

  this.admin_service.delete_team_members(this.root.TEAM_ID,this.users).subscribe((data) => {
    console.log(data);
  })

  this.toast.success({ detail: "Success Message", summary: "Team members updated successfully", duration: 3000 })

}

}

