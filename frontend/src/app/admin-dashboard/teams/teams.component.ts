import { Component } from '@angular/core';
import { AdminServiceService } from '@app/services/admin-services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { RootService } from '@app/services/root.service';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent {

  constructor(private admin_service:AdminServiceService, private router: Router, private route: ActivatedRoute, private toast: NgToastService,private root:RootService){}

  teams:any = []

  ngOnInit(): void {
    // this.userId = this.tokenStorage.getUser().userId

    this.admin_service.get_team().subscribe((data)=>{
      this.teams = data;
      console.warn("teams ",data);
    })

  }

  delete_team(id:any){

    for (let i = 0; i < this.teams.length; i++) {
      if (id == this.teams[i]._id) {
        this.teams.splice(i, 1);
        break;
      }
    }

    this.admin_service.delete_team(id).subscribe((data)=>{
      
      console.warn("deleted ",data);
      // setTimeout(() => {
      //   this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      // this.router.onSameUrlNavigation='reload';
      // this.router.navigate(['./'],{
      //   relativeTo:this.route
      // })
      // this.toast.success({ detail: "Success Message", summary: "User Deleted Successfully", duration: 3000 })
      // }, 1000);
      
    })

  }

  routeToUsers(teamId:any){
    this.root.TEAM_ID = teamId

    const encodeTeamData = btoa(teamId);
    window.sessionStorage.setItem('auth-team',encodeTeamData)
  }

}
