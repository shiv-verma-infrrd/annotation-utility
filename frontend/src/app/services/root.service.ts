import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class RootService {
  URL = "http://127.0.0.1:8008/";

  constructor() {}
}