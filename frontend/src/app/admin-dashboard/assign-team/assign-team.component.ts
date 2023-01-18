import { Component, ViewChild } from '@angular/core';
import { AdminServiceService } from '@app/services/admin-services.service';
import { ApiDataService } from '@app/services/api-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { faUserSecret } from '@fortawesome/free-solid-svg-icons';
import { NgToastService } from 'ng-angular-popup';
import { ThisReceiver } from '@angular/compiler';

@Component({
  selector: 'app-assign-team',
  templateUrl: './assign-team.component.html',
  styleUrls: ['./assign-team.component.css']
})
export class AssignTeamComponent {
  constructor(private admin_service: AdminServiceService,
    private toast: NgToastService,
    private router: Router,
    private route: ActivatedRoute,
    private apiData: ApiDataService) { }

  users: any = [];
  thumbnail = this.apiData.URL + "image/dimg.png"
  userimg = faUserSecret
  teamName: any = ""
  teams: any;
  teamData: any
  new_team = false;

  selectedUsers: any = [];

  ngOnInit(): void {
    this.admin_service.get_user().subscribe((data: any) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].role != 'admin') {
          this.users.push(data[i]);
        }

      }
      console.warn("users", data);
    })

    this.admin_service.get_team().subscribe((data: any) => {
      for (let i = 0; i < data.length; i++) {
        this.teams = data
      }
      console.warn("teams***", data);
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

  func(e: any, user_id: string, user_name: string) {
    const id = e.target.value;
    const ischecked = e.target.checked;

    const vari = { user_id, user_name };

    if (ischecked == true) {
      this.selectedUsers.push(vari)
      console.log(this.selectedUsers);
    }

    if (ischecked == false) {

      this.removeDocument(vari);
      console.log(this.selectedUsers);

    }
  }



  @ViewChild('te') new_team_name: any;


  printname(name: any) {
    this.teamData = name.value.split(',');
    // const team_id = name.innerHTML
    // console.log(this.new_team_name.nativeElement.value)

  }


  togglenewteam() {
    this.new_team = !this.new_team;
  }

  addToTeam() {
    const team_name = this.teamData[1]
    const team_id = this.teamData[0]

    console.log(team_name, this.selectedUsers);
    this.admin_service.add_to_team(team_id, team_name, this.selectedUsers).subscribe((data) => {
      console.log(data);
      // this.toast.success({ detail: "Success Message", summary: "Added to team", duration: 5000 });
      // this.selectedUsers.splice(0, this.selectedUsers.length)
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate(['./'], {
        relativeTo: this.route
      })
      this.toast.success({ detail: "Success Message", summary: "Added to team", duration: 2000 });
    })


  }

  addTonewTeam() {

    const team_name = this.new_team_name.nativeElement.value
    console.log(team_name, this.selectedUsers);
    this.admin_service.create_team(team_name, this.selectedUsers).subscribe((data) => {
      console.log(data);

      // for(let i=0;i<this.selectedUsers.length;i++){
      //   this.selectedUsers.splice(i, 1);
      // }

      
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate(['./'], {
          relativeTo: this.route
        })
        this.toast.success({ detail: "Success Message", summary: "Added to team", duration: 5000 });
      

    })

  }

}
