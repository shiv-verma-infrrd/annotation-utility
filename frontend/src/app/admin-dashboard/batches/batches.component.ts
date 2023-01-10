import { Component } from '@angular/core';
import { ApiDataService } from 'src/app/services/api-data.service';

@Component({
  selector: 'app-batches',
  templateUrl: './batches.component.html',
  styleUrls: ['./batches.component.css']
})
export class BatchesComponent {

  constructor(private api_data_service:ApiDataService){

  }

  Batches:any = []
  ngOnInit():any{

    this.api_data_service.batches("123").subscribe(data=>{
      this.Batches = data
      console.log(data)
    });

  }

}
