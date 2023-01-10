import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { NgToastService } from 'ng-angular-popup';
import { AdminServiceService } from '../../services/admin-services.service';
// import { LoginService } from '../services/login.service';
import { TokenStorageService } from '../../services/token-storage.service';

@Component({
  selector: 'app-create-new-users',
  templateUrl: './create-new-users.component.html',
  styleUrls: ['./create-new-users.component.css']
})
export class CreateNewUsersComponent {
  constructor(
    private admin_service:AdminServiceService,
    private tokenStorage: TokenStorageService, 
    private router: Router,
    private toast:NgToastService) { }
  
  image = "https://uat.infrrd.cloud/assets/images/logos/Infrrd-Logo-Transparent3.png"

  onSubmit(form: NgForm) {
    let name = form.value.name
    let username = form.value.username
    let email = form.value.email
    
    let password = form.value.password
    // let name = form.value.name
    let role = "User"
    if(form.value.user == true)
         role = "User"
    
    if(form.value.admin == true)
          role = "Admin"

    this.admin_service.create_user(name,username,email,password,role).subscribe(data=>console.log(data))      
    
  }


}
