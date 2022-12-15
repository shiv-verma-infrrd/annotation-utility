import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http'
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class LoginService {
    URL = "http://127.0.0.1:80/"
    
    constructor(private http:HttpClient, private router: Router) {}

    loginAuthenticate(username: string, password: string): Observable<any> {
      return this.http
      .post<any>(this.URL + '/login', {'email':username, 'password':password}, {observe: 'response'})
    }
}