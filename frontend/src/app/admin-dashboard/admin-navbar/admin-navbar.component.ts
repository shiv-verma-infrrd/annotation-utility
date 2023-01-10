import { Component } from '@angular/core';
import { faArrowRightFromBracket,faChessBoard,faFolder,faUsers,faUserPlus,faHome} from '@fortawesome/free-solid-svg-icons';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent {

  logout_icon = faArrowRightFromBracket
  dashboard_icon = faHome
  batch_icon = faFolder
  users_icon = faUsers
  create_new_user_icon = faUserPlus

  constructor(private loginService: LoginService){}

  onLogout(){
    this.loginService.logout()
  }

}
