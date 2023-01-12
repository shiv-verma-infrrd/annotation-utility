import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http'
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { RootService } from './root.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json', observe: 'response'})
};

@Injectable({
  providedIn: 'root'
})

export class LoginService extends RootService{
    isLoggedIn = false;
    
    constructor(private http:HttpClient, private router: Router) {
      super()
    }

    login(username: string, password: string): Observable<any> {
      console.log('called api')
      const httpHeaders = {
      };
      return this.http.post(this.URL + '/login', {
        'email':username, 'password':password
      }, httpHeaders)
    }

    logout(){
      console.log("storage cleared");
      this.isLoggedIn = false;
      window.sessionStorage.clear();
    }
}