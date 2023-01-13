import { Component } from '@angular/core';
import { AdminServiceService } from '@app/services/admin-services.service';
import { ApiDataService } from '@app/services/api-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { faUserSecret } from '@fortawesome/free-solid-svg-icons';
import { NgToastService } from 'ng-angular-popup';
@Component({
  selector: 'app-assign-team',
  templateUrl: './assign-team.component.html',
  styleUrls: ['./assign-team.component.css']
})
export class AssignTeamComponent {
  constructor(private admin_service: AdminServiceService,
    private toast: NgToastService,
    private apiData: ApiDataService) { }

  users: any = [];
  thumbnail = this.apiData.URL + "image/dimg.png"
  userimg = faUserSecret
  teamName:any = "sdfsf"

  selectedUsers: any = [];

  ngOnInit(): void {
    this.admin_service.get_user().subscribe((data:any) => {
      for(let i=0 ; i < data.length ; i++){
        if(data[i].role != 'admin'){
          this.users.push(data[i]);
        }
        
      }
      console.warn("users", data);
    })

    console.log(this.teamName);
    

  }

  removeDocument(doc: any) {
    for (let i = 0; i < this.selectedUsers.length; i++) {
      if (doc.userid == this.selectedUsers[i].userid) {
        this.selectedUsers.splice(i, 1);
        break;
      }
    }
  }

  func(e: any, userid: string, username: string) {
    const id = e.target.value;
    const ischecked = e.target.checked;

    const vari = { userid, username };

    if (ischecked == true) {
      this.selectedUsers.push(vari)
      console.log(this.selectedUsers);
    }

    if (ischecked == false) {

      this.removeDocument(vari);
      console.log(this.selectedUsers);

    }
  }

  addToTeam() {
    const team_name = this.teamName
    console.log(team_name);
    this.admin_service.create_team(team_name,this.selectedUsers).subscribe((data) => {
      console.log(data);
    })

  }

  printname(){
    console.log(this.teamName);
    
    
  }


}
