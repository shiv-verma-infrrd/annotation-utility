import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import 'leader-line';
import { ApiDataService } from '../services/api-data.service';
import { PlatformLocation } from '@angular/common' 
import { NgToastService } from 'ng-angular-popup';

declare let LeaderLine: any;
@Component({
  selector: 'app-editing-page',
  templateUrl: './editing-page.component.html',
  styleUrls: ['./editing-page.component.css'],
})
export class EditingPageComponent implements AfterViewInit {
  @ViewChild('custom_header_input_ref') custom_header_input_ref: any;
  @ViewChild('custom_question_input_ref') custom_question_input_ref: any;
  @ViewChild('custom_answer_input_ref') custom_answer_input_ref: any;
  @ViewChild('custom_other_input_ref') custom_other_input_ref: any;
  @ViewChild('display_entity_rect_ref') display_entity_rect_ref: any;
  @ViewChild('main_image_ref') img_ref: any;
  @ViewChild('svg_ref') svg_ref: any;
  @ViewChild('alert_ref') alert_ref: any;

  imgUrl: any;
  image_url: any;
  coordinate_array: any;
  json_input: any;
  api_result: any;
  alldoc: any;
  doc_id_index: any;

  img_length: number = 0;
  img_width: number = 0;
  times: number = 1;
  l: number = 0;
  c: number = 0;

  custom_input_type: any = 'Header';

  selected_input_ref: any; //used to store ref to any selected input (add or edit input)
  selected_input_type: string = '';
  selected_input_index: number = -1;

  custom_input_array1: number[] = [];
  custom_input_array2: number[] = [];

  header_entity_strings: string[] = [];
  header_entity_indexs: number[][] = [];

  other_entity_strings: string[] = [];
  other_entity_indexs: number[][] = [];

  question_entity_strings: string[] = [];
  question_entity_indexs: number[][] = [];

  answer_entity_strings: string[] = [];
  answer_entity_indexs: number[][] = [];
  used_token_map = new Map();
  link_map = new Map();

  entity_connector_line:any=undefined;


  // image portrait adjustment variables
  offset_length : number = 0;
  offset_width : number = 0;
  change_image_height : number = 0;
  change_image_width : number = 0;
   

  constructor(private apiData: ApiDataService, private router:Router, private location:PlatformLocation, private toast:NgToastService) {
    this.apiData.docData = window.sessionStorage.getItem('global_doc_id');
    this.apiData.batchData = window.sessionStorage.getItem('global_batch_id');
    this.imgUrl = this.apiData.URL;

    this.doc_id_index = window.sessionStorage.getItem('global_doc_id');
    // this.doc_id_index -= 1;


    
    this.apiData
      .get_pages(this.apiData.batchData, this.apiData.docData)
      .subscribe((data) => {
        this.image_url = data[0].imagePath;
        this.alldoc = this.apiData.docarray;
        if (data[0].isCorrected == 'true') {
          this.json_input = JSON.parse(
            JSON.stringify(data[0].correctedData.result)
          );
          this.coordinate_array = JSON.parse(
            JSON.stringify(data[0].correctedData.result)
          );
        } else {
          this.json_input = JSON.parse(JSON.stringify(data[0].kvpData.form));
          this.coordinate_array = JSON.parse(
            JSON.stringify(data[0].kvpData.form)
          );
        }
        this.api_result = data[0];

        console.log(data);

        this.token_label_intialization();
      });


      location.onPopState(() => {
        if(this.entity_connector_line!=undefined)
        {
          this.entity_connector_line.remove();
          this.entity_connector_line=undefined;
        }
      });
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      this.set_svg_dimensions();
      this.set_image_tokens();
    }, 1000);
  }

 
  set_image_tokens()
  {
    for (let i = 0; i < this.coordinate_array.length; i++) {
      this.coordinate_array[i].box[0] =
        (this.coordinate_array[i].box[0] / (this.offset_width)) * this.c;
      this.coordinate_array[i].box[1] =
        (this.coordinate_array[i].box[1] / (this.offset_length)) * this.l;
      this.coordinate_array[i].box[2] =
        (this.coordinate_array[i].box[2] / (this.offset_width)) * this.c;
      this.coordinate_array[i].box[3] =
        (this.coordinate_array[i].box[3] / (this.offset_length)) * this.l;
    }
  }

  set_svg_dimensions() {

    this.offset_length = this.img_ref.nativeElement.offsetHeight;
    this.offset_width = this.img_ref.nativeElement.offsetWidth;

    this.change_image_height = (window.innerHeight*89)/100;
    this.change_image_width = (window.innerWidth)/2;


    if(this.offset_length - this.change_image_height > this.offset_width - this.change_image_width)
    {
      this.img_length = this.change_image_height;
      this.img_width = (this.change_image_height)*(this.offset_width/this.offset_length);
    }

    else
    {
      this.img_width = this.change_image_width;
      this.img_length = (this.change_image_width)*(this.offset_length/this.offset_width); 
    }

    this.img_ref.nativeElement.style.height = this.img_length + "px";
    this.img_ref.nativeElement.style.width = this.img_width + "px";

    this.l = this.img_length;
    this.c = this.img_width;
  }

  close_alert() {
    this.alert_ref.nativeElement.style.display = 'none';
  }

  token_label_intialization() 
  {
    for (let i = 0; i < this.json_input.length; i++) {
      if (!this.link_map.has(i)) {
        if (this.json_input[i].label == 'header')
        {
          this.used_token_map.set(this.json_input[i].id, 1);
          this.header_entity_strings.push(this.json_input[i].text);
          this.header_entity_indexs.push([this.json_input[i].id]);
        } 
        else if (this.json_input[i].label == 'other') 
        {
          this.used_token_map.set(this.json_input[i].id, 1);
          this.other_entity_strings.push(this.json_input[i].text);
          this.other_entity_indexs.push([this.json_input[i].id]);
        }
        else if (this.json_input[i].label == 'question')
        {
          if(Object.entries(this.json_input[i].linking[0]).length> 0)
          {
            this.used_token_map.set(this.json_input[i].id, 1);
            this.question_entity_strings.push(this.json_input[i].text);
            this.question_entity_indexs.push([this.json_input[i].id]);
            //  this.answer_entity_strings.push('');
            //  this.answer_entity_indexs.push([]);
            let l_in = this.json_input[i].linking[0].linking[1];
            
            this.used_token_map.set(this.json_input[l_in].id, 1);
            this.answer_entity_strings.push(this.json_input[l_in].text);
            this.answer_entity_indexs.push([this.json_input[l_in].id]);
            this.link_map.set(l_in, 1);
          } 
          else 
          {
            this.used_token_map.set(this.json_input[i].id, 1);
            this.question_entity_strings.push(this.json_input[i].text);
            this.question_entity_indexs.push([this.json_input[i].id]);
            this.answer_entity_strings.push('');
            this.answer_entity_indexs.push([]);
          }
        } 
        else if (this.json_input[i].label == 'answer') 
        {
          if (Object.entries(this.json_input[i].linking[0]).length > 0) 
          {
            this.used_token_map.set(this.json_input[i].id, 1);
            this.answer_entity_strings.push(this.json_input[i].text);
            this.answer_entity_indexs.push([this.json_input[i].id]);
            //  this.question_entity_strings.push('');
            //  this.question_entity_indexs.push([]);
            let l_in = this.json_input[i].linking[0].linking[1];
            this.used_token_map.set(this.json_input[l_in].id, 1);
            this.question_entity_strings.push(this.json_input[l_in].text);
            this.question_entity_indexs.push([this.json_input[l_in].id]);
            this.link_map.set(l_in, 1);
          } else {
            this.used_token_map.set(this.json_input[i].id, 1);
            this.answer_entity_strings.push(this.json_input[i].text);
            this.answer_entity_indexs.push([this.json_input[i].id]);
            this.question_entity_strings.push('');
            this.question_entity_indexs.push([]);
          }
        }
      }
    }
  }
  image_token_click(id: number) 
  {
    if (this.used_token_map.has(id)) 
    {
      this.toast.warning({detail:"WARNING",summary:'This token has already been used',duration:5000});
    } 
    else {
      if (
        this.selected_input_type == 'q' ||
        this.selected_input_type == 'a' ||
        this.selected_input_type == 'h' ||
        this.selected_input_type == 'o'
      ) {
        if (this.selected_input_type == 'q') {
          this.used_token_map.set(id, 1);
          this.question_entity_indexs[this.selected_input_index].push(id);
          this.question_entity_strings[this.selected_input_index] +=
            ' ' + this.json_input[id].text;
        } else if (this.selected_input_type == 'a') {
          this.used_token_map.set(id, 1);
          this.answer_entity_indexs[this.selected_input_index].push(id);
          this.answer_entity_strings[this.selected_input_index] +=
            ' ' + this.json_input[id].text;
        } else if (this.selected_input_type == 'h') {
          this.used_token_map.set(id, 1);
          this.header_entity_indexs[this.selected_input_index].push(id);
          this.header_entity_strings[this.selected_input_index] +=
            ' ' + this.json_input[id].text;
        } else if (this.selected_input_type == 'o') {
          this.used_token_map.set(id, 1);
          this.other_entity_indexs[this.selected_input_index].push(id);
          this.other_entity_strings[this.selected_input_index] +=
            ' ' + this.json_input[id].text;
        }
      } else
      {
        // need to add string in inpt and index in array
        if (this.selected_input_type == 'ch') {
          this.used_token_map.set(id, 1);
          this.selected_input_ref.value += ' ' + this.json_input[id].text;
          this.custom_input_array1.push(id);
        } else if (this.selected_input_type == 'cq') {
          this.used_token_map.set(id, 1);
          this.selected_input_ref.value += ' ' + this.json_input[id].text;
          this.custom_input_array1.push(id);
        } else if (this.selected_input_type == 'ca') {
          this.used_token_map.set(id, 1);
          this.selected_input_ref.value += ' ' + this.json_input[id].text;
          this.custom_input_array2.push(id);
        } else if (this.selected_input_type == 'co') {
          this.used_token_map.set(id, 1);
          this.selected_input_ref.value += ' ' + this.json_input[id].text;
          this.custom_input_array1.push(id);
        }
      }
    }
  }
  zoom_in() {
    //if any entity is getting pointed in image
    this.display_entity_rect_ref.nativeElement.style.x = 0;
    this.display_entity_rect_ref.nativeElement.style.y = 0;
    this.display_entity_rect_ref.nativeElement.style.height = 0;
    this.display_entity_rect_ref.nativeElement.style.width = 0;

    if(this.entity_connector_line!=undefined)
    {
      this.entity_connector_line.remove();
      this.entity_connector_line=undefined;
    }

    if (this.times >= 2.5) return;
    this.times += 0.2;
    this.img_ref.nativeElement.style.height = this.l * this.times + 'px';
    this.img_ref.nativeElement.style.width = this.c * this.times + 'px';
    this.img_length = this.l * this.times;
    this.img_width = this.c * this.times;

    for (let i = 0; i < this.coordinate_array.length; i++) {
      this.coordinate_array[i].box[0] =
        (this.coordinate_array[i].box[0] / (this.times - 0.2)) * this.times;
      this.coordinate_array[i].box[1] =
        (this.coordinate_array[i].box[1] / (this.times - 0.2)) * this.times;
      this.coordinate_array[i].box[2] =
        (this.coordinate_array[i].box[2] / (this.times - 0.2)) * this.times;
      this.coordinate_array[i].box[3] =
        (this.coordinate_array[i].box[3] / (this.times - 0.2)) * this.times;
    }
  }

  zoom_out() {
    //if any entity is getting pointed in image
    this.display_entity_rect_ref.nativeElement.style.x = 0;
    this.display_entity_rect_ref.nativeElement.style.y = 0;
    this.display_entity_rect_ref.nativeElement.style.height = 0;
    this.display_entity_rect_ref.nativeElement.style.width = 0;

    if(this.entity_connector_line!=undefined)
    {
      this.entity_connector_line.remove();
      this.entity_connector_line=undefined;
    }

    this.times -= 0.2;
    this.img_ref.nativeElement.style.height = this.l * this.times + 'px';
    this.img_ref.nativeElement.style.width = this.c * this.times + 'px';
    this.img_length = this.l * this.times;
    this.img_width = this.c * this.times;

    for (let i = 0; i < this.coordinate_array.length; i++) {
      this.coordinate_array[i].box[0] =
        (this.coordinate_array[i].box[0] / (this.times + 0.2)) * this.times;
      this.coordinate_array[i].box[1] =
        (this.coordinate_array[i].box[1] / (this.times + 0.2)) * this.times;
      this.coordinate_array[i].box[2] =
        (this.coordinate_array[i].box[2] / (this.times + 0.2)) * this.times;
      this.coordinate_array[i].box[3] =
        (this.coordinate_array[i].box[3] / (this.times + 0.2)) * this.times;
    }
  }

  token_mouse_enter(data: any) {
    data.stroke = '#39a87a';
  }
  token_mouse_out(data: any) {
    data.stroke = '';
  }

  next_button_click() {
    this.clear_custom_input();
    this.clear_selected_input_ref();
    if (this.custom_input_type == 'Header') {
      this.custom_input_type = 'Q&A';
      this.custom_question_input_ref.nativeElement.style.display = 'block';
      this.custom_answer_input_ref.nativeElement.style.display = 'block';
      this.custom_header_input_ref.nativeElement.style.display = 'none';
      this.custom_other_input_ref.nativeElement.style.display = 'none';
    } else if (this.custom_input_type == 'Q&A') {
      this.custom_input_type = 'Other';
      this.custom_header_input_ref.nativeElement.style.display = 'none';
      this.custom_question_input_ref.nativeElement.style.display = 'none';
      this.custom_answer_input_ref.nativeElement.style.display = 'none';
      this.custom_other_input_ref.nativeElement.style.display = 'block';
    } else {
      this.custom_input_type = 'Header';
      this.custom_header_input_ref.nativeElement.style.display = 'block';
      this.custom_question_input_ref.nativeElement.style.display = 'none';
      this.custom_answer_input_ref.nativeElement.style.display = 'none';
      this.custom_other_input_ref.nativeElement.style.display = 'none';
    }
  }
  select_input(ref: any, type: any, index: number) {
    this.selected_input_ref = ref;
    this.selected_input_type = type;
    this.selected_input_index = index;

    if (type == 'cq' || type == 'ca' || type == 'ch' || type == 'co') {
      //if any entity is getting pointed in image
      this.display_entity_rect_ref.nativeElement.style.x = 0;
      this.display_entity_rect_ref.nativeElement.style.y = 0;

      this.display_entity_rect_ref.nativeElement.style.height = 0;
      this.display_entity_rect_ref.nativeElement.style.width = 0;

      if(this.entity_connector_line!=undefined)
      {
        this.entity_connector_line.remove();
        this.entity_connector_line=undefined;
      }
    }
  }

  make_custom_entity() {
    if (this.custom_input_type == 'Header') 
    {
      if (this.custom_header_input_ref.nativeElement.value == '') 
      {
      

        this.toast.warning({detail:"WARNING",summary:'Select tokens first to make an entity',duration:5000});
      } 
      else 
      {
        for (let i = 0; i < this.custom_input_array1.length; i++) 
        {
          this.used_token_map.set(this.custom_input_array1[i], 1);
        }

        // this.header_entity_indexs.push(this.custom_input_array1);
        // this.header_entity_strings.push(this.custom_header_input_ref.nativeElement.value);
        
        this.header_entity_indexs.unshift(this.custom_input_array1);
        this.header_entity_strings.unshift(this.custom_header_input_ref.nativeElement.value);

        this.custom_input_array1 = [];
        this.custom_header_input_ref.nativeElement.value = '';
      }
    } 
    else if (this.custom_input_type == 'Other')
    {
      if (this.custom_other_input_ref.nativeElement.value == '') 
      {
        
        this.toast.warning({detail:"WARNING",summary:'Select tokens first to make an entity',duration:5000});

      }
      else
      {
        for (let i = 0; i < this.custom_input_array1.length; i++) 
        {
          this.used_token_map.set(this.custom_input_array1[i], 1);
        }

        // this.other_entity_indexs.push(this.custom_input_array1);
        // this.other_entity_strings.push(this.custom_other_input_ref.nativeElement.value);
        
        this.other_entity_indexs.unshift(this.custom_input_array1);
        this.other_entity_strings.unshift(this.custom_other_input_ref.nativeElement.value);

        this.custom_input_array1 = [];
        this.custom_other_input_ref.nativeElement.value = '';
      }
    } else {
      if (
        this.custom_question_input_ref.nativeElement.value == '' ||
        this.custom_answer_input_ref.nativeElement.value == ''
      ) {
        

        this.toast.warning({detail:"WARNING",summary:'Select tokens first to make an entity',duration:5000});

      } else {
        for (let i = 0; i < this.custom_input_array1.length; i++) {
          this.used_token_map.set(this.custom_input_array1[i], 1);
        }
        for (let i = 0; i < this.custom_input_array2.length; i++) {
          this.used_token_map.set(this.custom_input_array2[i], 1);
        }

        // this.question_entity_indexs.push(this.custom_input_array1);
        // this.question_entity_strings.push(this.custom_question_input_ref.nativeElement.value);
        
        this.question_entity_indexs.unshift(this.custom_input_array1);
        this.question_entity_strings.unshift(this.custom_question_input_ref.nativeElement.value);

        // this.answer_entity_indexs.push(this.custom_input_array2);
        // this.answer_entity_strings.push(this.custom_answer_input_ref.nativeElement.value);

        this.answer_entity_indexs.unshift(this.custom_input_array2);
        this.answer_entity_strings.unshift(this.custom_answer_input_ref.nativeElement.value);
        

        this.custom_input_array1 = [];
        this.custom_input_array2 = [];

        this.custom_question_input_ref.nativeElement.value = '';
        this.custom_answer_input_ref.nativeElement.value = '';
      }
    }
  }
  clear_custom_input() {
    if (
      this.custom_input_type == 'Header' ||
      this.custom_input_type == 'Other'
    ) {
      for (let i = 0; i < this.custom_input_array1.length; i++) {
        this.used_token_map.delete(this.custom_input_array1[i]);
      }

      this.custom_input_array1 = [];

      this.custom_header_input_ref.nativeElement.value = '';
      this.custom_other_input_ref.nativeElement.value = '';
    } else {
      for (let i = 0; i < this.custom_input_array1.length; i++) {
        this.used_token_map.delete(this.custom_input_array1[i]);
      }
      for (let i = 0; i < this.custom_input_array2.length; i++) {
        this.used_token_map.delete(this.custom_input_array2[i]);
      }
      this.custom_input_array1 = [];
      this.custom_input_array2 = [];

      this.custom_question_input_ref.nativeElement.value = '';
      this.custom_answer_input_ref.nativeElement.value = '';
    }
  }
  clear_custom_input_cell() {
    if (
      this.selected_input_type == 'ch' ||
      this.selected_input_type == 'co' ||
      this.selected_input_type == 'cq'
    ) {
      for (let i = 0; i < this.custom_input_array1.length; i++) {
        this.used_token_map.delete(this.custom_input_array1[i]);
      }

      this.custom_input_array1 = [];
      this.selected_input_ref.value = '';
    } else {
      for (let i = 0; i < this.custom_input_array2.length; i++) {
        this.used_token_map.delete(this.custom_input_array2[i]);
      }

      this.custom_input_array2 = [];
      this.selected_input_ref.value = '';
    }
  }
  clear_entity_cell() {
    if (this.selected_input_type == 'q') {
      for (
        let i = 0;
        i < this.question_entity_indexs[this.selected_input_index].length;
        i++
      ) {
        this.used_token_map.delete(
          this.question_entity_indexs[this.selected_input_index][i]
        );
      }
      this.question_entity_strings[this.selected_input_index] = '';
      this.question_entity_indexs[this.selected_input_index] = [];
    } else if (this.selected_input_type == 'a') {
      for (
        let j = 0;
        j < this.answer_entity_indexs[this.selected_input_index].length;
        j++
      ) {
        this.used_token_map.delete(
          this.answer_entity_indexs[this.selected_input_index][j]
        );
      }
      this.answer_entity_strings[this.selected_input_index] = '';
      this.answer_entity_indexs[this.selected_input_index] = [];
    } else if (this.selected_input_type == 'h') {
      for (
        let j = 0;
        j < this.header_entity_indexs[this.selected_input_index].length;
        j++
      ) {
        this.used_token_map.delete(
          this.header_entity_indexs[this.selected_input_index][j]
        );
      }
      this.header_entity_strings[this.selected_input_index] = '';
      this.header_entity_indexs[this.selected_input_index] = [];
    } else if (this.selected_input_type == 'o') {
      for (
        let j = 0;
        j < this.other_entity_indexs[this.selected_input_index].length;
        j++
      ) {
        this.used_token_map.delete(
          this.other_entity_indexs[this.selected_input_index][j]
        );
      }
      this.other_entity_strings[this.selected_input_index] = '';
      this.other_entity_indexs[this.selected_input_index] = [];
    }
  }
  clear_selected_input_ref() {
    this.selected_input_ref = undefined;
    this.selected_input_type = '';
    this.selected_input_index = -1;
  }
  delete_entity(type: string, index: number) {
    //if any entity is getting pointed in image
    this.display_entity_rect_ref.nativeElement.style.x = 0;
    this.display_entity_rect_ref.nativeElement.style.y = 0;

    this.display_entity_rect_ref.nativeElement.style.height = 0;
    this.display_entity_rect_ref.nativeElement.style.width = 0;

    if(this.entity_connector_line!=undefined)
    {
      this.entity_connector_line.remove();
      this.entity_connector_line=undefined;
    }

    if (type == 'q') {
      for (let i = 0; i < this.question_entity_indexs[index].length; i++) {
        this.used_token_map.delete(this.question_entity_indexs[index][i]);
      }
      for (let j = 0; j < this.answer_entity_indexs[index].length; j++) {
        this.used_token_map.delete(this.answer_entity_indexs[index][j]);
      }
      this.question_entity_strings.splice(index, 1);
      this.question_entity_indexs.splice(index, 1);
      this.answer_entity_strings.splice(index, 1);
      this.answer_entity_indexs.splice(index, 1);
    } else if (type == 'h') {
      for (let i = 0; i < this.header_entity_indexs[index].length; i++) {
        this.used_token_map.delete(this.header_entity_indexs[index][i]);
      }
      this.header_entity_strings.splice(index, 1);
      this.header_entity_indexs.splice(index, 1);
    } else if (type == 'o') {
      for (let i = 0; i < this.other_entity_indexs[index].length; i++) {
        this.used_token_map.delete(this.other_entity_indexs[index][i]);
      }
      this.other_entity_strings.splice(index, 1);
      this.other_entity_indexs.splice(index, 1);
    }
  }

  save_all_data(condition: number) 
  {
    let result: any = [];
    let a, b, c, d;
    let t: any[] = [];

    for (let i = 0; i < this.question_entity_strings.length; i++) 
    {
      a = 99999;
      b = 99999;
      c = -1;
      d = -1;
      t = [];
      for (let j = 0; j < this.question_entity_indexs[i].length; j++) 
      {
        if (a > this.json_input[this.question_entity_indexs[i][j]].box[0])
          a = this.json_input[this.question_entity_indexs[i][j]].box[0];

        if (b > this.json_input[this.question_entity_indexs[i][j]].box[1])
          b = this.json_input[this.question_entity_indexs[i][j]].box[1];

        if (c < this.json_input[this.question_entity_indexs[i][j]].box[2])
          c = this.json_input[this.question_entity_indexs[i][j]].box[2];

        if (d < this.json_input[this.question_entity_indexs[i][j]].box[3])
          d = this.json_input[this.question_entity_indexs[i][j]].box[3];

        t.push({
          box: this.json_input[this.question_entity_indexs[i][j]].box,
          text: this.json_input[this.question_entity_indexs[i][j]].text,
        });
      }
      result.push({
        box: [a, b, c, d],
        text: this.question_entity_strings[i],
        label: 'question',
        words: t,
        linking: [{ linking: [result.length, result.length + 1] }],
        id: result.length,
      });

      a = 99999;
      b = 99999;
      c = -1;
      d = -1;
      t = [];
      for (let j = 0; j < this.answer_entity_indexs[i].length; j++) {
        if (a > this.json_input[this.answer_entity_indexs[i][j]].box[0])
          a = this.json_input[this.answer_entity_indexs[i][j]].box[0];

        if (b > this.json_input[this.answer_entity_indexs[i][j]].box[1])
          b = this.json_input[this.answer_entity_indexs[i][j]].box[1];

        if (c < this.json_input[this.answer_entity_indexs[i][j]].box[2])
          c = this.json_input[this.answer_entity_indexs[i][j]].box[2];

        if (d < this.json_input[this.answer_entity_indexs[i][j]].box[3])
          d = this.json_input[this.answer_entity_indexs[i][j]].box[3];

        t.push({
          box: this.json_input[this.answer_entity_indexs[i][j]].box,
          text: this.json_input[this.answer_entity_indexs[i][j]].text,
        });
      }
      result.push({
        box: [a, b, c, d],
        text: this.answer_entity_strings[i],
        label: 'answer',
        words: t,
        linking: [{ linking: [result.length, result.length - 1] }],
        id: result.length,
      });
    }

    for (let i = 0; i < this.header_entity_strings.length; i++) {
      a = 99999;
      b = 99999;
      c = -1;
      d = -1;
      t = [];
      for (let j = 0; j < this.header_entity_indexs[i].length; j++) {
        if (a > this.json_input[this.header_entity_indexs[i][j]].box[0])
          a = this.json_input[this.header_entity_indexs[i][j]].box[0];

        if (b > this.json_input[this.header_entity_indexs[i][j]].box[1])
          b = this.json_input[this.header_entity_indexs[i][j]].box[1];

        if (c < this.json_input[this.header_entity_indexs[i][j]].box[2])
          c = this.json_input[this.header_entity_indexs[i][j]].box[2];

        if (d < this.json_input[this.header_entity_indexs[i][j]].box[3])
          d = this.json_input[this.header_entity_indexs[i][j]].box[3];

        t.push({
          box: this.json_input[this.header_entity_indexs[i][j]].box,
          text: this.json_input[this.header_entity_indexs[i][j]].text,
        });
      }
      result.push({
        box: [a, b, c, d],
        text: this.header_entity_strings[i],
        label: 'header',
        words: t,
        linking: [{ linking: [] }],
        id: result.length,
      });
    }

    for (let i = 0; i < this.other_entity_strings.length; i++) {
      a = 99999;
      b = 99999;
      c = -1;
      d = -1;
      t = [];
      for (let j = 0; j < this.other_entity_indexs[i].length; j++) {
        if (a > this.json_input[this.other_entity_indexs[i][j]].box[0])
          a = this.json_input[this.other_entity_indexs[i][j]].box[0];

        if (b > this.json_input[this.other_entity_indexs[i][j]].box[1])
          b = this.json_input[this.other_entity_indexs[i][j]].box[1];

        if (c < this.json_input[this.other_entity_indexs[i][j]].box[2])
          c = this.json_input[this.other_entity_indexs[i][j]].box[2];

        if (d < this.json_input[this.other_entity_indexs[i][j]].box[3])
          d = this.json_input[this.other_entity_indexs[i][j]].box[3];

        t.push({
          box: this.json_input[this.other_entity_indexs[i][j]].box,
          text: this.json_input[this.other_entity_indexs[i][j]].text,
        });
      }
      result.push({
        box: [a, b, c, d],
        text: this.other_entity_strings[i],
        label: 'other',
        words: t,
        linking: [{ linking: [] }],
        id: result.length,
      });
    }
    //result contains updated kvpdata

    let final = {
      _id: this.api_result._id,
      imgid: this.api_result.imgid,
      documentId: this.api_result.documentId,
      batchName: this.api_result.batchName,
      document_name: this.api_result.document_name,
      isCorrected: 'true',
      imageStatus: this.api_result.imageStatus,
      imagePath: this.api_result.imagePath,
      kvpData: this.api_result.kvpData,
      correctedData: { result },
      correctedBy: '',
      correctedOn: '',
    };
    this.apiData.update_page_data(final).subscribe((data) => {
      console.warn(data);
    });

    if (condition == 0) {
      this.exit();
    } 
    else
    {
      this.doc_id_index++;
      // if (this.doc_id_index >= this.alldoc.length)
      // {
      //   alert('This is the last document of the batch');
      // } 
      // else
      // {
        window.sessionStorage.setItem('global_doc_id',this.doc_id_index);
        // console.log(window.sessionStorage.getItem('global_doc_id'));
        window.location.reload();
      // }
    }
  }

  exit() 
  {
    if(this.entity_connector_line!=undefined)
    {
      this.entity_connector_line.remove();
      this.entity_connector_line=undefined;
    }

    this.router.navigateByUrl('/batches');
  }

  entity_click(type: string, index: number,entity_ref:any)
  {
    var x = 99999,
      y = 99999,
      x2 = -1,
      y2 = -1;
    if (type == 'q') {
      for (let i = 0; i < this.question_entity_indexs[index].length; i++) {
        if (
          x >
          this.coordinate_array[this.question_entity_indexs[index][i]].box[0]
        )
          x =
            this.coordinate_array[this.question_entity_indexs[index][i]].box[0];

        if (
          y >
          this.coordinate_array[this.question_entity_indexs[index][i]].box[1]
        )
          y =
            this.coordinate_array[this.question_entity_indexs[index][0]].box[1];

        if (
          x2 <
          this.coordinate_array[this.question_entity_indexs[index][i]].box[2]
        )
          x2 =
            this.coordinate_array[this.question_entity_indexs[index][i]].box[2];

        if (
          y2 <
          this.coordinate_array[this.question_entity_indexs[index][i]].box[3]
        )
          y2 =
            this.coordinate_array[this.question_entity_indexs[index][i]].box[3];
      }
    } else if (type == 'a') {
      for (let i = 0; i < this.answer_entity_indexs[index].length; i++) {
        if (
          x > this.coordinate_array[this.answer_entity_indexs[index][i]].box[0]
        )
          x = this.coordinate_array[this.answer_entity_indexs[index][i]].box[0];

        if (
          y > this.coordinate_array[this.answer_entity_indexs[index][i]].box[1]
        )
          y = this.coordinate_array[this.answer_entity_indexs[index][0]].box[1];

        if (
          x2 < this.coordinate_array[this.answer_entity_indexs[index][i]].box[2]
        )
          x2 =
            this.coordinate_array[this.answer_entity_indexs[index][i]].box[2];

        if (
          y2 < this.coordinate_array[this.answer_entity_indexs[index][i]].box[3]
        )
          y2 =
            this.coordinate_array[this.answer_entity_indexs[index][i]].box[3];
      }
    } else if (type == 'h') {
      for (let i = 0; i < this.header_entity_indexs[index].length; i++) {
        if (
          x > this.coordinate_array[this.header_entity_indexs[index][i]].box[0]
        )
          x = this.coordinate_array[this.header_entity_indexs[index][i]].box[0];

        if (
          y > this.coordinate_array[this.header_entity_indexs[index][i]].box[1]
        )
          y = this.coordinate_array[this.header_entity_indexs[index][0]].box[1];

        if (
          x2 < this.coordinate_array[this.header_entity_indexs[index][i]].box[2]
        )
          x2 =
            this.coordinate_array[this.header_entity_indexs[index][i]].box[2];

        if (
          y2 < this.coordinate_array[this.header_entity_indexs[index][i]].box[3]
        )
          y2 =
            this.coordinate_array[this.header_entity_indexs[index][i]].box[3];
      }
    } else {
      for (let i = 0; i < this.other_entity_indexs[index].length; i++) {
        if (
          x > this.coordinate_array[this.other_entity_indexs[index][i]].box[0]
        )
          x = this.coordinate_array[this.other_entity_indexs[index][i]].box[0];

        if (
          y > this.coordinate_array[this.other_entity_indexs[index][i]].box[1]
        )
          y = this.coordinate_array[this.other_entity_indexs[index][0]].box[1];

        if (
          x2 < this.coordinate_array[this.other_entity_indexs[index][i]].box[2]
        )
          x2 = this.coordinate_array[this.other_entity_indexs[index][i]].box[2];

        if (
          y2 < this.coordinate_array[this.other_entity_indexs[index][i]].box[3]
        )
          y2 = this.coordinate_array[this.other_entity_indexs[index][i]].box[3];
      }
    }
   if(x!=99999)
   {
    this.display_entity_rect_ref.nativeElement.style.x = x;
    this.display_entity_rect_ref.nativeElement.style.y = y;

    this.display_entity_rect_ref.nativeElement.style.height = y2 - y;
    this.display_entity_rect_ref.nativeElement.style.width = x2 - x;

    //connecting-line stuff

    if(this.entity_connector_line!=undefined)
    {
      this.entity_connector_line.remove();
      this.entity_connector_line=undefined;
    }

    this.entity_connector_line=new LeaderLine(entity_ref,this.display_entity_rect_ref.nativeElement);
    this.entity_connector_line.size=2.75;
    this.entity_connector_line.dash=true;
    this.entity_connector_line.path="grid";
    this.entity_connector_line.color="#39a87a"; 
   }   
  }

  entity_line_adjuster()
  {
    if(this.entity_connector_line!=undefined)
    {
      this.entity_connector_line.position();
    }
  }
}
