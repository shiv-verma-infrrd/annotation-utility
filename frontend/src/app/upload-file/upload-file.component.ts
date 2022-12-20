import { Component,ElementRef, OnInit, ViewChild } from '@angular/core';
import { UploadFileService } from '../services/upload-file.service';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})
export class UploadFileComponent implements OnInit{

  shortLink: string = "";
  loading: boolean = false;
  file !: File;

  constructor(private uploadFileService: UploadFileService, private toast: NgToastService) { }

  ngOnInit(): void { }

  onChange(event: any) {
    this.file = event.target.files[0];
  }

  @ViewChild('batch_name') batch_name_input_field: any;


  onUpload() {
    this.loading = true;
    console.log(this.file);
    this.uploadFileService.upload(this.file, [this.batch_name_input_field.nativeElement.value])
      .subscribe((data) => {
        this.loading = false;
        console.log(data);
        this.toast.success({detail:"Success Message",summary:"Uploaded Successfully, Please fetch now",duration:3000})
      },err=>{
        this.loading = false;
        this.toast.error({detail:"Error Message",summary:err.Message,duration:3000})
      }

      );


  }
}
