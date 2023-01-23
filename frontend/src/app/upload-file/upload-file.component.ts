import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UploadFileService } from '@app/services/upload-file.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenStorageService } from '@app/services/token-storage.service';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})
export class UploadFileComponent implements OnInit {

  shortLink: string = "";
  loading: boolean = false;
  file !: File;
  uploadtype: any = [];

  user_id: any;

  constructor(private uploadFileService: UploadFileService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: NgToastService,
    private tokenStorage: TokenStorageService
  ) { }

  ngOnInit(): void {

    // this.user_id = this.tokenStorage.getUser().userId
    // console.log(this.user_id)

  }
  selected = false;
  onSelect(e: any) {
    let type = e.target.value
    if (!this.selected) {
      if (type == 'Both') {
        this.uploadtype.push('fields', 'checkboxes');
        this.selected = true;
      } else {
        this.uploadtype.push(type);
        this.selected=true;
      }
    }else{
      this.uploadtype = [];
      if (type == 'Both') {
        this.uploadtype.push('fields', 'checkboxes');
        this.selected = true;
      } else {
        this.uploadtype.push(type);
        this.selected=true;
      }
    }

    console.log(this.uploadtype);

  }

  onChange(event: any) {
    this.file = event.target.files[0];
  }

  @ViewChild('batch_name') batch_name_input_field: any;


  onUpload() {
    this.loading = true;
    console.log(this.file);
    this.uploadFileService.upload(this.file, [this.batch_name_input_field.nativeElement.value], this.tokenStorage.getUser().userId,this.uploadtype)
      .subscribe((data) => {
        this.loading = false;
        console.log(data);
        this.toast.success({ detail: "Success Message", summary: "Uploaded Successfully", duration: 3000 })


        // fetching 
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate(['./'], {
          relativeTo: this.route
        })
      }
        , err => {
          this.loading = false;
          console.log(err.message);

          this.toast.error({ detail: "Error Message", summary: err.Message, duration: 3000 })
        }

      );


  }
}
