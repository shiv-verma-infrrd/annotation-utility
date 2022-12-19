import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';
import { NgToastService } from 'ng-angular-popup';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChild('alert_ref') alert_ref: any;

  alert_message: string = '';
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  constructor(private loginService: LoginService, 
    private tokenStorage: TokenStorageService, 
    private router: Router,
    private toast:NgToastService) { }

  ngOnInit() {
    if (this.tokenStorage.getToken()) {
      this.loginService.isLoggedIn = true;
      this.roles = this.tokenStorage.getUser().roles;
      this.router.navigate(['batches'])
    }
  }

  close_alert() {
    this.alert_ref.nativeElement.style.display = 'none';
  }

  onSubmit(form: NgForm) {
    this.loginService.login(form.value.username, form.value.password)
    .subscribe({
      next: data=>{
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data);

        this.isLoginFailed = false;
        this.loginService.isLoggedIn = true;
        this.toast.success({detail:"Success Message",summary:"Logged in Succesfully",duration:3000});
        this.roles = this.tokenStorage.getUser().roles;
        this.router.navigate(['batches'])
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
        this.toast.error({detail:"Error Message",summary:this.errorMessage,duration:3000})
        form.resetForm()
      }
    })
  }
}
