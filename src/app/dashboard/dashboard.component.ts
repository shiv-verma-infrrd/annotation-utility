import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  batches=[
    {name:'batch 1',thumbnail:"https://cdn-icons-png.flaticon.com/512/3767/3767084.png"},
    {name:'batch 2',thumbnail:"https://cdn-icons-png.flaticon.com/512/3767/3767084.png"},
    {name:'batch 3',thumbnail:"https://cdn-icons-png.flaticon.com/512/3767/3767084.png"},
    {name:'batch 4',thumbnail:"https://cdn-icons-png.flaticon.com/512/3767/3767084.png"},
    {name:'batch 5',thumbnail:"https://cdn-icons-png.flaticon.com/512/3767/3767084.png"},
    {name:'batch 6',thumbnail:"https://cdn-icons-png.flaticon.com/512/3767/3767084.png"}
  ];
}
