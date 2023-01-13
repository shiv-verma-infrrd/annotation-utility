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
  constructor(private admin_service:AdminServiceService,
    private toast: NgToastService,
    private apiData:ApiDataService)
    {}

  users:any = [];
  thumbnail = this.apiData.URL + "image/dimg.png"
  userimg = faUserSecret
  
  ngOnInit(): void {
    this.admin_service.get_user().subscribe((data)=>{
      this.users = data;
      console.warn("users",data);
    })

  }

  func(){

  }
}
