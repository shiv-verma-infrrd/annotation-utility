import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http'
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Router } from '@angular/router';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})

export class LoginService {
    URL = "http://127.0.0.1:80/"
    isLoggedIn = false;
    
    constructor(private http:HttpClient, private router: Router) {}

    login(username: string, password: string): Observable<any> {
      return this.http.post(this.URL + '/login', {
        'email':username, 'password':password
      }, httpOptions)
    }
}