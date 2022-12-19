import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private logout:TokenStorageService) { }

  ngOnInit(): void {
  }

  onLogout(){
    console.log("storage cleared");
    this.logout.signOut();
  }
}
