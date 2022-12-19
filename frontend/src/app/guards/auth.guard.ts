import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router){}

  canActivate(): boolean{
    if(this.loginService.isLoggedIn == true){
      return true
    }
    else{
      this.router.navigate([''])
      return false
    }
  }
  
}
