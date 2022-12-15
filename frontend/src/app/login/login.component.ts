import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loggedIn = false;
  token = ''
  constructor(private loginService: LoginService, private router: Router) { }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    this.loginService.loginAuthenticate(form.value.username, form.value.password)
    .subscribe({
      next: (data: any)=>{
        // console.log(data.status)
        this.router.navigate(['batches'])
      }
    })
  }
}
