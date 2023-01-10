import { Component } from '@angular/core';
import { AdminServiceService } from 'src/app/services/admin-services.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {

  constructor(private admin_service:AdminServiceService ){}

  users:any = []
  
  ngOnInit(): void {
    // this.userId = this.tokenStorage.getUser().userId

    this.admin_service.get_user().subscribe((data)=>{
      this.users = data;
      console.warn("users",data);
    })

  }

}
