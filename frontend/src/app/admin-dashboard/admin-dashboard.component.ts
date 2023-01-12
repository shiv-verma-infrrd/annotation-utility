import { Component } from '@angular/core';
import { AdminServiceService } from '../services/admin-services.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {

  

  constructor(private admin_service:AdminServiceService){}

   ngOnInit():any{

   }

}
