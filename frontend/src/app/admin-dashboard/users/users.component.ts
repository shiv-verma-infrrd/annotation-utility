import { Component } from '@angular/core';
import { AdminServiceService } from '@app/services/admin-services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  constructor(private admin_service:AdminServiceService, private router: Router, private route: ActivatedRoute, private toast: NgToastService){}

  users:any = []
  
  ngOnInit(): void {
    // this.userId = this.tokenStorage.getUser().userId

    this.admin_service.get_user().subscribe((data)=>{
      this.users = data;
      console.warn("users",data);
    })

  }

  delete_user(user_id:any){
    this.admin_service.delete_user(user_id).subscribe((data)=>{
     setTimeout(() => {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation='reload';
    this.router.navigate(['./'],{
      relativeTo:this.route
    })
    this.toast.success({ detail: "Success Message", summary: "User Deleted Successfully", duration: 3000 })
    }, 1000);
    })

  }

}
