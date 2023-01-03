import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
export class EditingPageComponent implements AfterViewInit 
{
  @ViewChild('image_ref') image_ref:any;
  @ViewChild('custom_header_input_ref') custom_header_input_ref: any;
  @ViewChild('custom_question_input_ref') custom_question_input_ref: any;
  @ViewChild('custom_answer_input_ref') custom_answer_input_ref: any;
  @ViewChild('custom_other_input_ref') custom_other_input_ref: any;
  @ViewChild('display_entity_rect_ref') display_entity_rect_ref: any;
  @ViewChild('actual_checkbox_checkbox') actual_checkbox_ref:any;
  
  imageUrl:any;
  doc_id:any;

  api_result:any;

  image_src:any;
  token_cord_for_image:any=[];
  token_cord_for_cal:any=[];

  offset_height:number = 0;
  offset_width:number = 0;
  image_height:number = 0;
  image_width:number = 0;
  times:number = 1;
  l:number = 0;
  c:number = 0;

  question_entity_strings:string[]=[];
  question_entity_ids:number[][]=[];

  answer_entity_strings:string[]=[];
  answer_entity_ids:number[][]=[];

  header_entity_strings:string[]=[];
  header_entity_ids:number[][]=[];

  other_entity_strings:string[]=[];
  other_entity_ids:number[][]=[];

  cord_id_map=new Map();
  entity_intial_map=new Map();
  used_token_map=new Map();

  custom_input_type: any = 'Header';

  selected_input_ref: any; //used to store ref to any selected input (add or edit input)
  selected_input_type: string = '';
  selected_input_index: number = -1;
  seleceted_input_option_index: number = -1;

  custom_input_array1: number[] = [];
  custom_input_array2: number[] = [];

  entity_connector_line: any = undefined;
  some_changes_done:number=0;
  display_question:number=0;
  display_answer:number=0;
  display_header:number=0;
  display_other:number=0;
 
//******************** checkbox related variables *********************
  checkbox_question_string:string[] = [];
  checkbox_question_id:number[][] = [];

  options_strings:string[][] = []; 
  option_string_id:number[][][] = []; 

  actual_checkbox_id:number[][] = [];
  actual_checkbox_value:string[][] = [];

  custom_option_array1:number[]=[];
  custom_option_array2:number[]=[];

  header_checkbox:number = 0;
  header_fields:number = 1;

  custom_token_x:number=0;
  custom_token_y:number=0;
  custom_token_h:number=0;
  custom_token_w:number=0;

  custom_token_making=0;

  saving_data_result:any;
  
  
  constructor(private apiData: ApiDataService, private router:Router, private location:PlatformLocation, private toast:NgToastService)
  {
    this.apiData.docData = window.sessionStorage.getItem('global_doc_id');
    this.apiData.batchData = window.sessionStorage.getItem('global_batch_id');
    this.imageUrl = this.apiData.URL;

    this.doc_id= window.sessionStorage.getItem('global_doc_id');
    
    this.apiData.get_pages(this.apiData.batchData, this.apiData.docData).subscribe((data) => 
    {    

      this.image_src = data[0].imagePath;
      this.saving_data_result = data[0]

      console.log(data[0]);
      

    if(data[0].type == 'checkboxes'){
        this.api_result=JSON.parse(JSON.stringify((data[0].Data.ocrData)));
        this.token_extractor_from_grouping(JSON.parse(JSON.stringify((data[0].Data.ocrData))));
        console.log("checkboxes being called");
        
    }
    else{

      if(data[0].isCorrected == 'true'){

      this.api_result=JSON.parse(JSON.stringify((data[0].correctedData.kvpData.form)));
      this.token_extractor_from_grouping(JSON.parse(JSON.stringify((data[0].correctedData.kvpData.form))));
      this.kvp_label_initialization();

      console.log();
      
      }
      else{

      this.api_result=JSON.parse(JSON.stringify((data[0].Data.kvpData.form)));
      this.token_extractor_from_grouping(JSON.parse(JSON.stringify((data[0].Data.kvpData.form))));
      this.kvp_label_initialization();

      }    
    }

    });

    console.log(this.api_result);
    
     
    location.onPopState(() => {
      if(this.entity_connector_line!=undefined)
      {
        this.entity_connector_line.remove();
        this.entity_connector_line=undefined;
      }
    });
  }
///////////////////////////////////////////////////// Common ///////////////////////////////////////////////////////////////////

  ngAfterViewInit(): void 
  {
    setTimeout(()=>{
      this.image_height = this.image_ref.nativeElement.offsetHeight;
      this.image_width = this.image_ref.nativeElement.offsetWidth;
      
      this.viewport_image_adjuster();
      this.viewport_token_cord_adjuster();
      }, 1000);
  }


  token_extractor_from_grouping(data:any)
  {
    let count=0;
    for(let i=0;i<data.length;i++)
    {
      for(let j=0;j<data[i].words.length;j++)
      {
            
            this.token_cord_for_image.push(
              JSON.parse(JSON.stringify({
                "box":data[i].words[j].box,
                "text":data[i].words[j].text,
                "id":count
              }))  
            );

            this.token_cord_for_cal.push(
              JSON.parse(JSON.stringify({
                "box":data[i].words[j].box,
                "text":data[i].words[j].text,
                "id":count
              }))
            );

            this.cord_id_map.set(JSON.stringify(data[i].words[j].box),count);

            count++;
      }
    }
  }

  viewport_image_adjuster()
  { 
    let window_image_height = (window.innerHeight*89)/100;
    let window_image_width = (window.innerWidth)/2;

    this.offset_height = this.image_ref.nativeElement.offsetHeight;
    this.offset_width = this.image_ref.nativeElement.offsetWidth;

    if(this.offset_height > this.offset_width)
    {
      this.image_height = window_image_height;
      this.image_width = (window_image_height)*(this.offset_width/this.offset_height);
    }
    else
    {
      this.image_width = window_image_width;
      this.image_height = (window_image_width)*(this.offset_height/this.offset_width); 
    }

    this.image_ref.nativeElement.style.height = this.image_height + "px";
    this.image_ref.nativeElement.style.width = this.image_width + "px";

    this.l = this.image_height;
    this.c = this.image_width;
  }

  viewport_token_cord_adjuster()
  {
    for (let i = 0; i < this.token_cord_for_image.length; i++) {
      this.token_cord_for_image[i].box[0] =
        (this.token_cord_for_image[i].box[0] / (this.offset_width)) * this.image_width;
      this.token_cord_for_image[i].box[1] =
        (this.token_cord_for_image[i].box[1] / (this.offset_height)) * this.image_height;
      this.token_cord_for_image[i].box[2] =
        (this.token_cord_for_image[i].box[2] / (this.offset_width)) * this.image_width;
      this.token_cord_for_image[i].box[3] =
        (this.token_cord_for_image[i].box[3] / (this.offset_height)) * this.image_height;
    }
  }

  image_zoom_in()
  {
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
    this.image_ref.nativeElement.style.height = this.l * this.times + 'px';
    this.image_ref.nativeElement.style.width = this.c * this.times + 'px';
    this.image_height = this.l * this.times;
    this.image_width = this.c * this.times;

    for (let i = 0; i < this.token_cord_for_image.length; i++) 
    {
      this.token_cord_for_image[i].box[0] = (this.token_cord_for_image[i].box[0] / (this.times - 0.2)) * this.times;
      this.token_cord_for_image[i].box[1] = (this.token_cord_for_image[i].box[1] / (this.times - 0.2)) * this.times;
      this.token_cord_for_image[i].box[2] = (this.token_cord_for_image[i].box[2] / (this.times - 0.2)) * this.times;
      this.token_cord_for_image[i].box[3] = (this.token_cord_for_image[i].box[3] / (this.times - 0.2)) * this.times;
    }
  }

  image_zoom_out()
  {
    this.display_entity_rect_ref.nativeElement.style.x = 0;
    this.display_entity_rect_ref.nativeElement.style.y = 0;
    this.display_entity_rect_ref.nativeElement.style.height = 0;
    this.display_entity_rect_ref.nativeElement.style.width = 0;

    if(this.entity_connector_line!=undefined)
    {
      this.entity_connector_line.remove();
      this.entity_connector_line=undefined;
    }

    if(this.times<=0.4)
    return;

    this.times -= 0.2;
    this.image_ref.nativeElement.style.height = this.l * this.times + 'px';
    this.image_ref.nativeElement.style.width = this.c * this.times + 'px';
    this.image_height = this.l * this.times;
    this.image_width = this.c * this.times;

    for (let i = 0; i < this.token_cord_for_image.length; i++) 
    {
      this.token_cord_for_image[i].box[0] = (this.token_cord_for_image[i].box[0] / (this.times + 0.2)) * this.times;
      this.token_cord_for_image[i].box[1] = (this.token_cord_for_image[i].box[1] / (this.times + 0.2)) * this.times;
      this.token_cord_for_image[i].box[2] = (this.token_cord_for_image[i].box[2] / (this.times + 0.2)) * this.times;
      this.token_cord_for_image[i].box[3] = (this.token_cord_for_image[i].box[3] / (this.times + 0.2)) * this.times;
    }
  }

  token_mouse_enter(data: any) 
  {
    data.stroke = '#39a87a';
  }

  token_mouse_out(data: any) 
  {
    data.stroke = '';
  }

  custom_token_process_start(event:any,ref:any,custom_token_input_ref:any)
  {
      this.custom_token_x=event.clientX-ref.getBoundingClientRect().left;
      this.custom_token_y=event.clientY-ref.getBoundingClientRect().top;
      this.custom_token_w=0;
      this.custom_token_h=0;

      custom_token_input_ref.style.display="none";
      
      this.custom_token_making=1;
  }

  custom_token_process_between(event:any,ref:any)
  {
    if(this.custom_token_making==1)
    { 
     this.custom_token_w=(event.clientX-ref.getBoundingClientRect().left)-this.custom_token_x;
     this.custom_token_h=(event.clientY-ref.getBoundingClientRect().top)-this.custom_token_y;
    }
  }

  custom_token_process_end(event:any,custom_token_input_ref:any)
  {
     this.custom_token_making=0;
     if(this.custom_token_h!=0)
     {
      custom_token_input_ref.style.display="flex";

      custom_token_input_ref.style.top=event.clientY+"px";
      custom_token_input_ref.style.left=event.clientX+"px";
     }
  }

  make_custom_token(custom_token_input_ref:any)
  {
    custom_token_input_ref.style.display="none";
   
    this.token_cord_for_image.push({
     "box":[this.custom_token_x,this.custom_token_y,this.custom_token_x+this.custom_token_w,this.custom_token_y+this.custom_token_h],
     "text":'[]',
     "id":this.token_cord_for_image.length
    });

    this.token_cord_for_cal.push({
      "box":[this.custom_token_x,this.custom_token_y,this.custom_token_x+this.custom_token_w,this.custom_token_y+this.custom_token_h],
      "text":'[]',
      "id":this.token_cord_for_cal.length
     });
     
    this.custom_token_w=0;
    this.custom_token_h=0;


    //  console.log(this.token_cord_for_image);
    //  console.log(this.token_cord_for_cal);
     
  }


////////////////////////////////////////////////////Field //////////////////////////////////////////////
  kvp_label_initialization()
  {
    for(let i=0;i<this.api_result.length;i++)
    {
      if(!this.entity_intial_map.has(this.api_result[i].id))
      {
        if(this.api_result[i].label=="question")
        {
          this.entity_intial_map.set(this.api_result[i].id,1)// add in entity map

          this.question_entity_strings.push(JSON.parse(JSON.stringify(this.api_result[i].text)));
          var t:number[]=[];
          for(let j=0;j<this.api_result[i].words.length;j++)
          {
            t.push(this.cord_id_map.get(JSON.stringify(this.api_result[i].words[j].box)));
            this.used_token_map.set(t[t.length-1],1);
          }
          this.question_entity_ids.push(t);

          if(Object.entries(this.api_result[i].linking[0]).length > 0)
          {
            var z_o_in = 0;
            if (this.api_result[i].linking[0].linking[0] == this.api_result[i].id)
              z_o_in = 1;
            else
              z_o_in = 0;

            var link_ind = -1;
            var max_pob = -1;
            var count = 0;
            for (let x in this.api_result[i].linking) 
            {
              if (!this.entity_intial_map.has(this.api_result[i].linking[x].linking[z_o_in]) &&
                 this.api_result[i].linking[x].prob_score > max_pob)
              {
                max_pob = this.api_result[i].linking[x].prob_score;
                link_ind = count;
              }
              count++;
            }

            if (link_ind == -1)
            {
              this.answer_entity_strings.push('');
              this.answer_entity_ids.push([]);
            }
            else
            {
              let linked_token_id =this.api_result[i].linking[link_ind].linking[z_o_in];
              
              this.entity_intial_map.set(this.api_result[linked_token_id].id,1)// add in entity map

              this.answer_entity_strings.push(JSON.parse(JSON.stringify(this.api_result[linked_token_id].text)));
              var temp:number[]=[];
              for(let j=0;j<this.api_result[linked_token_id].words.length;j++)
              {
                  temp.push(this.cord_id_map.get(JSON.stringify(this.api_result[linked_token_id].words[j].box)));
                  this.used_token_map.set(temp[temp.length-1],1);    
              }
              this.answer_entity_ids.push(temp);
            }
          }
          else
          {
            this.answer_entity_strings.push('');
            this.answer_entity_ids.push([]);
          }
        }
        else if(this.api_result[i].label=="answer")
        {
          this.entity_intial_map.set(this.api_result[i].id,1)// add in entity map

          this.answer_entity_strings.push(JSON.parse(JSON.stringify(this.api_result[i].text)));
          var t:number[]=[];
          for(let j=0;j<this.api_result[i].words.length;j++)
          {
              t.push(this.cord_id_map.get(JSON.stringify(this.api_result[i].words[j].box)));
              this.used_token_map.set(t[t.length-1],1);
          }
          this.answer_entity_ids.push(t);

          
          if(Object.entries(this.api_result[i].linking[0]).length > 0)
          {
            var z_o_in = 0;
            if (this.api_result[i].linking[0].linking[0] == this.api_result[i].id)
              z_o_in = 1;
            else
             z_o_in = 0;

            var link_ind = -1;
            var max_pob = -1;
            var count = 0;
            for (let x in this.api_result[i].linking) 
            {
              if (!this.entity_intial_map.has(this.api_result[i].linking[x].linking[z_o_in]) &&
                 this.api_result[i].linking[x].prob_score > max_pob)
              {
                max_pob = this.api_result[i].linking[x].prob_score;
                link_ind = count;
              }
              count++;
            }

            if (link_ind == -1)
            {
              this.question_entity_strings.push('');
              this.question_entity_ids.push([]);
            }
            else
            {
              let linked_token_id =this.api_result[i].linking[link_ind].linking[z_o_in];
              
              this.entity_intial_map.set(this.api_result[linked_token_id].id,1)// add in entity map

              this.question_entity_strings.push(JSON.parse(JSON.stringify(this.api_result[linked_token_id].text)));
              var temp:number[]=[];
              for(let j=0;j<this.api_result[linked_token_id].words.length;j++)
              {
                  temp.push(this.cord_id_map.get(JSON.stringify(this.api_result[linked_token_id].words[j].box)));
                  this.used_token_map.set(temp[temp.length-1],1);
    
              }
              this.question_entity_ids.push(temp);
            }
          }
          else
          {
            this.question_entity_strings.push('');
            this.question_entity_ids.push([]);
          }
        }
        else if(this.api_result[i].label=="header")
        {
          this.header_entity_strings.push(JSON.parse(JSON.stringify(this.api_result[i].text)));
          
          var t:number[]=[];
          for(let j=0;j<this.api_result[i].words.length;j++)
          {
              t.push(this.cord_id_map.get(JSON.stringify(this.api_result[i].words[j].box)));
              this.used_token_map.set(t[t.length-1],1);
          }
          this.header_entity_ids.push(t);
        }
        else 
        {
          this.other_entity_strings.push(JSON.parse(JSON.stringify(this.api_result[i].text)));
          
          var t:number[]=[];
          for(let j=0;j<this.api_result[i].words.length;j++)
          {
              t.push(this.cord_id_map.get(JSON.stringify(this.api_result[i].words[j].box)));
              this.used_token_map.set(t[t.length-1],1);
          }
          this.other_entity_ids.push(t);
        }
      }
    }
  }



  /////////////////////////////////////////////////////////////////common//////////////////////////////////////////////////////////////////////////////////
  image_token_click(token_id:number)
  {

    //chedkhani code me
    if(this.selected_input_type == "checkbox_question")
    {
      if(this.custom_option_array1.length>0)
      {
        for(let i = 0; i<this.custom_option_array1.length; i++)
        {
          this.used_token_map.delete(this.custom_option_array1[i]);
        }

        for(let i = 0; i<this.custom_option_array2.length; i++)
        {
          this.used_token_map.delete(this.custom_option_array2[i]);
        }
      }
      this.custom_option_array1 = [];
      this.custom_option_array2 = [];
    }

    if(this.used_token_map.has(token_id))
    {
      this.toast.warning({detail:"WARNING",summary:'This token has already been used',duration:5000});
    }
    else
    {
      this.display_entity_rect_ref.nativeElement.style.x = 0;
      this.display_entity_rect_ref.nativeElement.style.y = 0;

      this.display_entity_rect_ref.nativeElement.style.height = 0;
      this.display_entity_rect_ref.nativeElement.style.width = 0;

      if(this.entity_connector_line!=undefined)
      {
        this.entity_connector_line.remove();
        this.entity_connector_line=undefined;
      }


      if (this.selected_input_type == 'q' || this.selected_input_type =='a' ||this.selected_input_type =='h' ||this.selected_input_type == 'o' || this.selected_input_type == 'option_checkbox_string')
      {
        if (this.selected_input_type == 'q') 
        {
          this.used_token_map.set(token_id, 1);
          this.question_entity_ids[this.selected_input_index].push(token_id);
          this.question_entity_strings[this.selected_input_index]+= ' ' + this.token_cord_for_image[token_id].text;
        }

        else if (this.selected_input_type == 'a') 
        {
          this.used_token_map.set(token_id, 1);
          this.answer_entity_ids[this.selected_input_index].push(token_id);
          this.answer_entity_strings[this.selected_input_index] += ' ' + this.token_cord_for_image[token_id].text;
        }
        else if (this.selected_input_type == 'h') 
        {
          this.used_token_map.set(token_id, 1);
          this.header_entity_ids[this.selected_input_index].push(token_id);
          this.header_entity_strings[this.selected_input_index] += ' ' + this.token_cord_for_image[token_id].text;
        }
        else if (this.selected_input_type == 'o')
        {
          this.used_token_map.set(token_id, 1);
          this.other_entity_ids[this.selected_input_index].push(token_id);
          this.other_entity_strings[this.selected_input_index] += ' ' + this.token_cord_for_image[token_id].text;
        }
        else if(this.selected_input_type == 'option_checkbox_string')
        {
          this.used_token_map.set(token_id, 1);
          this.option_string_id[this.selected_input_index][this.seleceted_input_option_index].push(token_id);
          this.options_strings[this.selected_input_index][this.seleceted_input_option_index] += ' '+this.token_cord_for_image[token_id].text;
        }
      
      }

      else
      {
        if (this.selected_input_type == 'ch')
        {
          this.used_token_map.set(token_id, 1);
          this.selected_input_ref.value += ' ' + this.token_cord_for_image[token_id].text;
          this.custom_input_array1.push(token_id);
        } 
        else if (this.selected_input_type == 'cq')
        {
          this.used_token_map.set(token_id, 1);
          this.selected_input_ref.value += ' ' + this.token_cord_for_image[token_id].text;
          this.custom_input_array1.push(token_id);
        }
        else if (this.selected_input_type == 'ca') 
        {
          this.used_token_map.set(token_id, 1);
          this.selected_input_ref.value += ' ' + this.token_cord_for_image[token_id].text;
          this.custom_input_array2.push(token_id);
        }
        else if (this.selected_input_type == 'co')
        {
          this.used_token_map.set(token_id, 1);
          this.selected_input_ref.value += ' ' + this.token_cord_for_image[token_id].text;
          this.custom_input_array1.push(token_id);
        }

        else if(this.selected_input_type == 'checkbox_string')
        {
          this.used_token_map.set(token_id, 1);
          this.selected_input_ref.value += ' ' + this.token_cord_for_image[token_id].text;
          this.custom_option_array1.push(token_id);
        }
        else if(this.selected_input_type == 'checkbox_question')
        { 
          this.used_token_map.set(token_id, 1)
          // this.selected_input_ref.value += ' ' + this.token_cord_for_image[token_id].text;
          this.checkbox_question_string[this.selected_input_index]+=' ' + this.token_cord_for_image[token_id].text;
          this.checkbox_question_id[this.selected_input_index].push(token_id);
        }

        else if(this.selected_input_type == "actual_check")
        {
          this.used_token_map.set(token_id, 1)
          this.selected_input_ref.value += 'Checkbox Selected';
          this.custom_option_array2.push(token_id);
        }
      }
    }
  }
  

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  display_category_label(type:string)
  {
    if(type=='q')
    {
      if(this.display_question==0) 
       this.display_question=1;
      else
      this.display_question=0; 
    }
    else if(type=='a')
    {
      if(this.display_answer==0) 
       this.display_answer=1;
      else
      this.display_answer=0;
    }
    else if(type=='h')
    {
      if(this.display_header==0) 
       this.display_header=1;
      else
      this.display_header=0;
    }
    else
    {
      if(this.display_other==0) 
       this.display_other=1;
      else
      this.display_other=0;
    }
  }
  
  select_input_for_editing(ref: any, type: any, index: number)
  {
    this.selected_input_ref = ref;
    this.selected_input_type = type;
    this.selected_input_index = index;  
    
    if (type == 'cq' || type == 'ca' || type == 'ch' || type == 'co') 
    {
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

  pop_token_from_entity()
  { 
    this.some_changes_done=1;

    if (this.selected_input_type == 'q') 
    {
        let remain_length=this.question_entity_ids[this.selected_input_index].length;

        if(remain_length==0)
        return;

        this.used_token_map.delete(this.question_entity_ids[this.selected_input_index][remain_length-1]);

        let deleted_token_id=this.question_entity_ids[this.selected_input_index][remain_length-1];
        this.question_entity_ids[this.selected_input_index].pop();

        var pos=this.question_entity_strings[this.selected_input_index].lastIndexOf(this.token_cord_for_image[deleted_token_id].text);

        this.question_entity_strings[this.selected_input_index]=
        this.question_entity_strings[this.selected_input_index].substring(0,pos)
        +
        this.question_entity_strings[this.selected_input_index].substring(pos+this.token_cord_for_image[deleted_token_id].text.length,this.question_entity_strings[this.selected_input_index].length);

        //check if only spaces left
        let space_count=0;
        for(let k=0;k<this.question_entity_strings[this.selected_input_index].length;k++)
        {
          if(this.question_entity_strings[this.selected_input_index][k]==' ')
          space_count++;
        }

        if(space_count==this.question_entity_strings[this.selected_input_index].length)
        this.question_entity_strings[this.selected_input_index]='';
    } 
    else if (this.selected_input_type == 'a')
    {
      let remain_length=this.answer_entity_ids[this.selected_input_index].length;

      if(remain_length==0)
      return;

      this.used_token_map.delete(this.answer_entity_ids[this.selected_input_index][remain_length-1]);

      let deleted_token_id=this.answer_entity_ids[this.selected_input_index][remain_length-1];
      this.answer_entity_ids[this.selected_input_index].pop();

      var pos=this.answer_entity_strings[this.selected_input_index].lastIndexOf(this.token_cord_for_image[deleted_token_id].text);

      this.answer_entity_strings[this.selected_input_index]=
      this.answer_entity_strings[this.selected_input_index].substring(0,pos)
      +
      this.answer_entity_strings[this.selected_input_index].substring(pos+this.token_cord_for_image[deleted_token_id].text.length,this.answer_entity_strings[this.selected_input_index].length);

      //check if only spaces left
      let space_count=0;
      for(let k=0;k<this.answer_entity_strings[this.selected_input_index].length;k++)
      {
        if(this.answer_entity_strings[this.selected_input_index][k]==' ')
        space_count++;
      }

      if(space_count==this.answer_entity_strings[this.selected_input_index].length)
      this.answer_entity_strings[this.selected_input_index]='';
    } 
    else if (this.selected_input_type == 'h') 
    {
      let remain_length=this.header_entity_ids[this.selected_input_index].length;

      if(remain_length==0)
      return;

      this.used_token_map.delete(this.header_entity_ids[this.selected_input_index][remain_length-1]);

      let deleted_token_id=this.header_entity_ids[this.selected_input_index][remain_length-1];
      this.header_entity_ids[this.selected_input_index].pop();

      var pos=this.header_entity_strings[this.selected_input_index].lastIndexOf(this.token_cord_for_image[deleted_token_id].text);

      this.header_entity_strings[this.selected_input_index]=
      this.header_entity_strings[this.selected_input_index].substring(0,pos)
      +
      this.header_entity_strings[this.selected_input_index].substring(pos+this.token_cord_for_image[deleted_token_id].text.length,this.header_entity_strings[this.selected_input_index].length);

      //check if only spaces left
      let space_count=0;
      for(let k=0;k<this.header_entity_strings[this.selected_input_index].length;k++)
      {
        if(this.header_entity_strings[this.selected_input_index][k]==' ')
        space_count++;
      }

      if(space_count==this.header_entity_strings[this.selected_input_index].length)
      this.header_entity_strings[this.selected_input_index]='';
    } 
    else if (this.selected_input_type == 'o')
    {
      let remain_length=this.other_entity_ids[this.selected_input_index].length;

      if(remain_length==0)
      return;

      this.used_token_map.delete(this.other_entity_ids[this.selected_input_index][remain_length-1]);

      let deleted_token_id=this.other_entity_ids[this.selected_input_index][remain_length-1];
      this.other_entity_ids[this.selected_input_index].pop();

      var pos=this.other_entity_strings[this.selected_input_index].lastIndexOf(this.token_cord_for_image[deleted_token_id].text);

      this.other_entity_strings[this.selected_input_index]=
      this.other_entity_strings[this.selected_input_index].substring(0,pos)
      +
      this.other_entity_strings[this.selected_input_index].substring(pos+this.token_cord_for_image[deleted_token_id].text.length,this.other_entity_strings[this.selected_input_index].length);

      //check if only spaces left
      let space_count=0;
      for(let k=0;k<this.other_entity_strings[this.selected_input_index].length;k++)
      {
        if(this.other_entity_strings[this.selected_input_index][k]==' ')
        space_count++;
      }

      if(space_count==this.other_entity_strings[this.selected_input_index].length)
      this.other_entity_strings[this.selected_input_index]='';
    }
  }

  next_button_click()
  {
    this.clear_custom_input();
    this.clear_selected_input_ref();

    if (this.custom_input_type == 'Header') 
    {
      this.custom_input_type = 'Q&A';
      this.custom_question_input_ref.nativeElement.style.display = 'block';
      this.custom_answer_input_ref.nativeElement.style.display = 'block';
      this.custom_header_input_ref.nativeElement.style.display = 'none';
      this.custom_other_input_ref.nativeElement.style.display = 'none';
    }
    else if (this.custom_input_type == 'Q&A') 
    {
      this.custom_input_type = 'Other';
      this.custom_header_input_ref.nativeElement.style.display = 'none';
      this.custom_question_input_ref.nativeElement.style.display = 'none';
      this.custom_answer_input_ref.nativeElement.style.display = 'none';
      this.custom_other_input_ref.nativeElement.style.display = 'block';
    } 
    else
    {
      this.custom_input_type = 'Header';
      this.custom_header_input_ref.nativeElement.style.display = 'block';
      this.custom_question_input_ref.nativeElement.style.display = 'none';
      this.custom_answer_input_ref.nativeElement.style.display = 'none';
      this.custom_other_input_ref.nativeElement.style.display = 'none';
    }
  }

  make_custom_entity()
  {
    if (this.custom_input_type == 'Header') 
    {
      if (this.custom_header_input_ref.nativeElement.value == '') 
      {
        this.toast.warning({detail:"WARNING",summary:'Select tokens first to make an entity',duration:5000});
      } 
      else 
      {
        this.some_changes_done=1;

        for (let i = 0; i < this.custom_input_array1.length; i++) 
        {
          this.used_token_map.set(this.custom_input_array1[i], 1);
        }

        // this.header_entity_indexs.push(this.custom_input_array1);
        // this.header_entity_strings.push(this.custom_header_input_ref.nativeElement.value);
        
        this.header_entity_ids.unshift(this.custom_input_array1);
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
        this.some_changes_done=1;

        for (let i = 0; i < this.custom_input_array1.length; i++) 
        {
          this.used_token_map.set(this.custom_input_array1[i], 1);
        }

        // this.other_entity_indexs.push(this.custom_input_array1);
        // this.other_entity_strings.push(this.custom_other_input_ref.nativeElement.value);
        
        this.other_entity_ids.unshift(this.custom_input_array1);
        this.other_entity_strings.unshift(this.custom_other_input_ref.nativeElement.value);

        this.custom_input_array1 = [];
        this.custom_other_input_ref.nativeElement.value = '';
      }
    } 
    else 
    {
      if (this.custom_question_input_ref.nativeElement.value == '' || this.custom_answer_input_ref.nativeElement.value == '') 
      {
        this.toast.warning({detail:"WARNING",summary:'Select tokens first to make an entity',duration:5000});

      } 
      else 
      {
        this.some_changes_done=1;
        
        for (let i = 0; i < this.custom_input_array1.length; i++) 
        {
          this.used_token_map.set(this.custom_input_array1[i], 1);
        }

        for (let i = 0; i < this.custom_input_array2.length; i++) 
        {
          this.used_token_map.set(this.custom_input_array2[i], 1);
        }

        // this.question_entity_indexs.push(this.custom_input_array1);
        // this.question_entity_strings.push(this.custom_question_input_ref.nativeElement.value);
        
        this.question_entity_ids.unshift(this.custom_input_array1);
        this.question_entity_strings.unshift(this.custom_question_input_ref.nativeElement.value);

        // this.answer_entity_indexs.push(this.custom_input_array2);
        // this.answer_entity_strings.push(this.custom_answer_input_ref.nativeElement.value);

        this.answer_entity_ids.unshift(this.custom_input_array2);
        this.answer_entity_strings.unshift(this.custom_answer_input_ref.nativeElement.value);
        

        this.custom_input_array1 = [];
        this.custom_input_array2 = [];

        this.custom_question_input_ref.nativeElement.value = '';
        this.custom_answer_input_ref.nativeElement.value = '';
      }
    }
  }


  clear_custom_input() 
  {
    if (this.custom_input_type == 'Header' ||this.custom_input_type == 'Other') 
    {
      for (let i = 0; i < this.custom_input_array1.length; i++)
      {
        this.used_token_map.delete(this.custom_input_array1[i]);
      }

      this.custom_input_array1 = [];

      this.custom_header_input_ref.nativeElement.value = '';
      this.custom_other_input_ref.nativeElement.value = '';
    } 
    else
    {
      for (let i = 0; i < this.custom_input_array1.length; i++)
      {
        this.used_token_map.delete(this.custom_input_array1[i]);
      }
      
      for (let i = 0; i < this.custom_input_array2.length; i++)
      {
        this.used_token_map.delete(this.custom_input_array2[i]);
      }
      this.custom_input_array1 = [];
      this.custom_input_array2 = [];

      this.custom_question_input_ref.nativeElement.value = '';
      this.custom_answer_input_ref.nativeElement.value = '';
    }
  }
  
  clear_custom_input_cell() 
  {
    if (this.selected_input_type == 'ch' ||this.selected_input_type == 'co' ||this.selected_input_type == 'cq')
    {
      for (let i = 0; i < this.custom_input_array1.length; i++) 
      {
        this.used_token_map.delete(this.custom_input_array1[i]);
      }

      this.custom_input_array1 = [];
      this.selected_input_ref.value = '';
    } 
    else
    {
      for (let i = 0; i < this.custom_input_array2.length; i++) 
      {
        this.used_token_map.delete(this.custom_input_array2[i]);
      }

      this.custom_input_array2 = [];
      this.selected_input_ref.value = '';
    }
  }


  clear_selected_input_ref()
  {
    this.selected_input_ref = undefined;
    this.selected_input_type = '';
    this.selected_input_index = -1;
  }

  delete_entity(type:string,index:number)
  {
    this.some_changes_done = 1;

    // if any entity is getting pointed in image
    this.display_entity_rect_ref.nativeElement.style.x = 0;
    this.display_entity_rect_ref.nativeElement.style.y = 0;

    this.display_entity_rect_ref.nativeElement.style.height = 0;
    this.display_entity_rect_ref.nativeElement.style.width = 0;

    if (this.entity_connector_line != undefined) 
    {
      this.entity_connector_line.remove();
      this.entity_connector_line = undefined;
    }

    if (type == 'q') 
    {
      // console.log(this.question_entity_ids[index]);
      // console.log(this.answer_entity_ids[index]);
      
      
      for (let i = 0; i < this.question_entity_ids[index].length; i++)
      {
        this.used_token_map.delete(this.question_entity_ids[index][i]);
      }
      
      for (let j = 0; j < this.answer_entity_ids[index].length; j++) 
      {
        this.used_token_map.delete(this.answer_entity_ids[index][j]);
      }

      this.question_entity_strings.splice(index, 1);
      this.question_entity_ids.splice(index, 1);
      this.answer_entity_strings.splice(index, 1);
      this.answer_entity_ids.splice(index, 1);
    } 
    else if (type == 'h') 
    {
      for (let i = 0; i < this.header_entity_ids[index].length; i++) 
      {
        this.used_token_map.delete(this.header_entity_ids[index][i]);
      }

      this.header_entity_strings.splice(index, 1);
      this.header_entity_ids.splice(index, 1);
    } 
    else if (type == 'o')
    {
      for (let i = 0; i < this.other_entity_ids[index].length; i++) 
      {
        this.used_token_map.delete(this.other_entity_ids[index][i]);
      }
      this.other_entity_strings.splice(index, 1);
      this.other_entity_ids.splice(index, 1);
    }
  }
  
  entity_click(type: string, index: number, entity_ref: any)
  {
    var x = 99999,
      y = 99999,
      x2 = -1,
      y2 = -1;
    if (type == 'q') 
    {
      for (let i = 0; i < this.question_entity_ids[index].length; i++) 
      {
        if(x>this.token_cord_for_image[this.question_entity_ids[index][i]].box[0])
          x=this.token_cord_for_image[this.question_entity_ids[index][i]].box[0];
        if(y>this.token_cord_for_image[this.question_entity_ids[index][i]].box[1])
          y=this.token_cord_for_image[this.question_entity_ids[index][i]].box[1];
        if(x2<this.token_cord_for_image[this.question_entity_ids[index][i]].box[2])
          x2 =this.token_cord_for_image[this.question_entity_ids[index][i]].box[2];
        if(y2 <this.token_cord_for_image[this.question_entity_ids[index][i]].box[3])
          y2 =this.token_cord_for_image[this.question_entity_ids[index][i]].box[3];
      }
    }

    else if (type == 'a') 
    {
      for (let i = 0; i < this.answer_entity_ids[index].length; i++) 
      {
        if(x>this.token_cord_for_image[this.answer_entity_ids[index][i]].box[0])
          x = this.token_cord_for_image[this.answer_entity_ids[index][i]].box[0];
        if(y>this.token_cord_for_image[this.answer_entity_ids[index][i]].box[1])
          y=this.token_cord_for_image[this.answer_entity_ids[index][i]].box[1];
        if(x2<this.token_cord_for_image[this.answer_entity_ids[index][i]].box[2])
          x2 =this.token_cord_for_image[this.answer_entity_ids[index][i]].box[2];
        if(y2<this.token_cord_for_image[this.answer_entity_ids[index][i]].box[3])
          y2=this.token_cord_for_image[this.answer_entity_ids[index][i]].box[3];
      }
    }

    else if (type == 'h') 
    {
      for (let i = 0; i < this.header_entity_ids[index].length; i++)
      {
        if (x > this.token_cord_for_image[this.header_entity_ids[index][i]].box[0])
          x = this.token_cord_for_image[this.header_entity_ids[index][i]].box[0];
        if (y > this.token_cord_for_image[this.header_entity_ids[index][i]].box[1])
          y = this.token_cord_for_image[this.header_entity_ids[index][i]].box[1];
        if (x2 < this.token_cord_for_image[this.header_entity_ids[index][i]].box[2])
          x2 = this.token_cord_for_image[this.header_entity_ids[index][i]].box[2];
        if(y2 < this.token_cord_for_image[this.header_entity_ids[index][i]].box[3])
          y2 =this.token_cord_for_image[this.header_entity_ids[index][i]].box[3];
      }
    }

    else
    {
      for (let i = 0; i < this.other_entity_ids[index].length; i++) 
      {
        if (x > this.token_cord_for_image[this.other_entity_ids[index][i]].box[0])
          x = this.token_cord_for_image[this.other_entity_ids[index][i]].box[0];
        if (y > this.token_cord_for_image[this.other_entity_ids[index][i]].box[1])
          y = this.token_cord_for_image[this.other_entity_ids[index][i]].box[1];
        if (x2 < this.token_cord_for_image[this.other_entity_ids[index][i]].box[2])
          x2 = this.token_cord_for_image[this.other_entity_ids[index][i]].box[2];
        if (y2 < this.token_cord_for_image[this.other_entity_ids[index][i]].box[3])
          y2 = this.token_cord_for_image[this.other_entity_ids[index][i]].box[3];
      }
    }

    if (x != 99999) 
    {
      this.display_entity_rect_ref.nativeElement.style.x = x;
      this.display_entity_rect_ref.nativeElement.style.y = y;

      this.display_entity_rect_ref.nativeElement.style.height = y2 - y;
      this.display_entity_rect_ref.nativeElement.style.width = x2 - x;

      //connecting-line stuff

      if (this.entity_connector_line != undefined) 
      {
        this.entity_connector_line.remove();
        this.entity_connector_line = undefined;
      }

      this.entity_connector_line = new LeaderLine(entity_ref,this.display_entity_rect_ref.nativeElement);
      this.entity_connector_line.size = 2.75;
      this.entity_connector_line.dash = true;
      this.entity_connector_line.path = 'grid';
      this.entity_connector_line.color = '#39a87a';

    }
  }

  entity_line_adjuster()
  {
    if(this.entity_connector_line!=undefined)
    {
      this.entity_connector_line.position();
    }
  }
////////////////////////////////Checkbox ///////////////////////////////////////////////////

enable_border_fields(fields_border:any, checkboxes_border:any)
{
  fields_border.style.borderBottom = "7px solid #39a87a";
  checkboxes_border.style.borderBottom = "none";
  this.header_fields = 1;
  this.header_checkbox = 0;

  ////////////////////////////////////Remove leader line//////////////////////////////////////////////////////////
  this.display_entity_rect_ref.nativeElement.style.x = 0;
  this.display_entity_rect_ref.nativeElement.style.y = 0;

  this.display_entity_rect_ref.nativeElement.style.height = 0;
  this.display_entity_rect_ref.nativeElement.style.width = 0;

  if(this.entity_connector_line!=undefined)
  {
    this.entity_connector_line.remove();
    this.entity_connector_line=undefined;
  }



  //////////////////////////////////////////////////////////////////////remove selected input////////////////////////////////////////////////
  if(this.custom_option_array1.length>0)
      {
        for(let i = 0; i<this.custom_option_array1.length; i++)
        {
          this.used_token_map.delete(this.custom_option_array1[i]);
        }

        for(let i = 0; i<this.custom_option_array2.length; i++)
        {
          this.used_token_map.delete(this.custom_option_array2[i]);
        }
      }
      this.custom_option_array1 = [];
      this.custom_option_array2 = [];
}

enable_border_checkboxes(fields_border:any, checkboxes_border:any)
{
  checkboxes_border.style.borderBottom = "7px solid #39a87a";
  fields_border.style.borderBottom = "none";
  this.header_fields = 0;
  this.header_checkbox = 1;

  ////////////////////////////////////Remove leader line//////////////////////////////////////////////////////////
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

add_checkbox()
{

  if(this.checkbox_question_string.length!= 0)
  {
    if(this.checkbox_question_string[this.checkbox_question_string.length-1]=="" || this.options_strings.length<this.checkbox_question_string.length || this.actual_checkbox_value.length<this.checkbox_question_string.length)
    this.toast.warning({detail:"WARNING",summary:'First make the above checkbox',duration:5000});

    else
    {
    this.checkbox_question_string.push("");
    this.checkbox_question_id.push([]);
    }
  }

  else
  {
  this.checkbox_question_string.push("");
  this.checkbox_question_id.push([]);
  }


  ////////////////////////////////////Remove leader line//////////////////////////////////////////////////////////
  this.display_entity_rect_ref.nativeElement.style.x = 0;
  this.display_entity_rect_ref.nativeElement.style.y = 0;

  this.display_entity_rect_ref.nativeElement.style.height = 0;
  this.display_entity_rect_ref.nativeElement.style.width = 0;

  if(this.entity_connector_line!=undefined)
  {
    this.entity_connector_line.remove();
    this.entity_connector_line=undefined;
  }
  // this.options_strings.push([""]);
  // this.option_string_id.push([]);
  // this.checkbox_id.push([]);
}


select_checkbox_for_editing(ref: any, type: any, index: number, option_index: number)
{
  this.selected_input_ref = ref;
  this.selected_input_type = type;
  this.selected_input_index = index; 
  this.seleceted_input_option_index = option_index;
}


clear_custom_option_cell() 
  {
    if (this.selected_input_type == 'checkbox_string')
    {
      for (let i = 0; i < this.custom_option_array1.length; i++) 
      {
        this.used_token_map.delete(this.custom_option_array1[i]);
      }

      this.custom_option_array1 = [];
      this.selected_input_ref.value = '';
    } 

    else if(this.selected_input_type == "actual_check")
    {
      for (let i = 0; i < this.custom_option_array2.length; i++) 
      {
        this.used_token_map.delete(this.custom_option_array2[i]);
      }

      this.custom_option_array2 = [];
      this.selected_input_ref.value = '';
    }
  }


  pop_option_from_entity()
  {

    if(this.selected_input_type == "checkbox_question" || this.selected_input_type == "option_checkbox_string")
    {
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
    
    if(this.selected_input_type == "checkbox_question")
    {
      if(this.checkbox_question_id[this.selected_input_index].length == 0)
      return;


      let last_index = this.checkbox_question_id[this.selected_input_index][this.checkbox_question_id[this.selected_input_index].length-1];
      this.checkbox_question_id[this.selected_input_index].pop()

      this.used_token_map.delete(last_index);

      this.checkbox_question_string[this.selected_input_index] = "";

      console.log(this.checkbox_question_string[this.selected_input_index])

      let t = "";

      for(let i = 0; i<this.checkbox_question_id[this.selected_input_index].length; i++)
      {
        if(t == "")
        t += this.token_cord_for_image[this.checkbox_question_id[this.selected_input_index][i]].text;

        else
        t += " "+this.token_cord_for_image[this.checkbox_question_id[this.selected_input_index][i]].text;
      }

     
      this.checkbox_question_string[this.selected_input_index] = t;
    }

    else if(this.selected_input_type == "option_checkbox_string")
    {
      if(this.option_string_id[this.selected_input_index][this.seleceted_input_option_index].length == 0)
      return;

      let last_index = this.option_string_id[this.selected_input_index][this.seleceted_input_option_index][this.option_string_id[this.selected_input_index][this.seleceted_input_option_index].length-1];
      this.option_string_id[this.selected_input_index][this.seleceted_input_option_index].pop()

      this.used_token_map.delete(last_index);

      this.options_strings[this.selected_input_index][this.seleceted_input_option_index] = "";

      // console.log(this.checkbox_question_string[this.selected_input_index])

      let t = "";

      for(let i = 0; i<this.option_string_id[this.selected_input_index][this.seleceted_input_option_index].length; i++)
      {
        if(t == "")
        t += this.token_cord_for_image[this.option_string_id[this.selected_input_index][this.seleceted_input_option_index][i]].text;

        else
        t += " "+this.token_cord_for_image[this.option_string_id[this.selected_input_index][this.seleceted_input_option_index][i]].text;
      }

     
      this.options_strings[this.selected_input_index][this.seleceted_input_option_index] = t;
    }

  }



  add_the_value_to_div(index:number, input_ref_clicked:any, actual_checkbox:any, checkbox_question_input_ref: any)
  {
    if(this.custom_option_array1.length==0||this.custom_option_array2.length==0)
    {
      this.toast.warning({detail:"WARNING",summary:'Select all the tokens first to make checkbox entity',duration:5000});
    }
    else
    {
        if(index<this.options_strings.length)
        { 
          let t="";
          for(let i=0;i<this.custom_option_array1.length;i++)
          {
            if(t=="")
            {
              t+=this.token_cord_for_image[this.custom_option_array1[i]].text;
              console.log('1:' + this.option_string_id[index].length);
              
              this.option_string_id[index].push([this.custom_option_array1[i]]);  
            }

            else
            {
              t+=" "+this.token_cord_for_image[this.custom_option_array1[i]].text;

              console.log('2:' + this.option_string_id[index].length);
              
              this.option_string_id[index][this.option_string_id[index].length-1].push(this.custom_option_array1[i]);
            }
          }
          this.options_strings[index].push(t);
          this.custom_option_array1=[];
        }

        else
        {
          let t="";

          for(let i=0;i<this.custom_option_array1.length;i++)
          {
            if(t=="")
            {
              t+=this.token_cord_for_image[this.custom_option_array1[i]].text;
            }

            else
            {
              t+=" "+this.token_cord_for_image[this.custom_option_array1[i]].text;
            }
          }

          this.options_strings.push([t]);

          this.option_string_id.push([this.custom_option_array1]);

          this.custom_option_array1=[];
        }

        
        if(index<this.actual_checkbox_id.length)
        {
          for(let i=0;i<this.custom_option_array2.length;i++)
          this.actual_checkbox_id[index].push(this.custom_option_array2[i]);

          this.actual_checkbox_value[index].push('Unchecked');
          this.custom_option_array2=[];
        }

        else
        { 
          this.actual_checkbox_id.push(this.custom_option_array2);

          this.actual_checkbox_value.push(['Unchecked']);
          this.custom_option_array2=[];
        }
        
        console.log(this.checkbox_question_string);
        console.log(this.checkbox_question_id);
        
        console.log(this.options_strings);
        console.log(this.option_string_id);

        input_ref_clicked.value = '';
        actual_checkbox.value = '';
    }
    

  ////////////////////////////////////Remove leader line//////////////////////////////////////////////////////////
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


  checkbox_clicked(index: number, j:number)
  {
    if(this.actual_checkbox_value[index][j] == "Unchecked")
    {
    this.actual_checkbox_value[index][j] = "Checked";
    }

    else
    {
    this.actual_checkbox_value[index][j] = "Unchecked";
    }


  ////////////////////////////////////Remove leader line//////////////////////////////////////////////////////////
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


  delete_checkbox_question(index:number)
  {
    
    if(this.checkbox_question_id.length>index)
    for(let i = 0; i<this.checkbox_question_id[index].length; i++)
    this.used_token_map.delete(this.checkbox_question_id[index][i]);

    if(this.option_string_id.length>index)
    for(let i = 0; i<this.option_string_id[index].length; i++)
    {
    for(let j = 0; j<this.option_string_id[index][i].length; j++)
    {
    this.used_token_map.delete(this.option_string_id[index][i][j]);
    }
    }


    if(this.actual_checkbox_id.length>index)
    for(let i = 0; i<this.actual_checkbox_id[index].length; i++)
    {
      this.used_token_map.delete(this.actual_checkbox_id[index][i]);
    }

    // for(let i = 0; i<this.actual_checkbox_id[index].length; i++)
    // this.used_token_map.delete(this.option_string_id[index][i]);

    if(this.option_string_id.length>index)
    {
    this.options_strings.splice(index, this.options_strings[index].length);
    this.option_string_id.splice(index, this.option_string_id[index].length);
    }

    if(this.actual_checkbox_id.length>index)
    {
    this.actual_checkbox_value.splice(index, this.actual_checkbox_value[index].length);
    this.actual_checkbox_id.splice(index, this.actual_checkbox_id[index].length);
    }

    this.checkbox_question_string.splice(index, 1);
    this.checkbox_question_id.splice(index, 1);
    


  ////////////////////////////////////Remove leader line//////////////////////////////////////////////////////////
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


  delete_checkbox_option(question_index:number, checkbox_index:number)
  {
    
    this.used_token_map.delete(this.actual_checkbox_id[question_index][checkbox_index]);

    for(let j = 0; j<this.option_string_id[question_index][checkbox_index].length; j++)
    {
    this.used_token_map.delete(this.option_string_id[question_index][checkbox_index][j]);
    }

    this.options_strings[question_index].splice(checkbox_index, 1);
    this.option_string_id[question_index].splice(checkbox_index, 1);
    this.actual_checkbox_value[question_index].splice(checkbox_index, 1);
    this.actual_checkbox_id[question_index].splice(checkbox_index, 1);


  ////////////////////////////////////Remove leader line//////////////////////////////////////////////////////////
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

  checkbox_option_click(type:string, index:number, option_index:number, value_clicked:any)
  {  
    var x = 99999,
    y = 99999,
    x2 = -1,
    y2 = -1;

    if (type == 'checkbox_string') 
    {
      for (let i = 0; i < this.option_string_id[index][option_index].length; i++) 
      {
        if(x>this.token_cord_for_image[this.option_string_id[index][option_index][i]].box[0])
          x=this.token_cord_for_image[this.option_string_id[index][option_index][i]].box[0];
        if(y>this.token_cord_for_image[this.option_string_id[index][option_index][i]].box[1])
          y=this.token_cord_for_image[this.option_string_id[index][option_index][i]].box[1];
        if(x2<this.token_cord_for_image[this.option_string_id[index][option_index][i]].box[2])
          x2 =this.token_cord_for_image[this.option_string_id[index][option_index][i]].box[2];
        if(y2 <this.token_cord_for_image[this.option_string_id[index][option_index][i]].box[3])
          y2 =this.token_cord_for_image[this.option_string_id[index][option_index][i]].box[3];
      }
    }

    else if (type == 'actual_checkbox') 
    {
      
        if(x>this.token_cord_for_image[this.actual_checkbox_id[index][option_index]].box[0])
          x = this.token_cord_for_image[this.actual_checkbox_id[index][option_index]].box[0];
        if(y>this.token_cord_for_image[this.actual_checkbox_id[index][option_index]].box[1])
          y=this.token_cord_for_image[this.actual_checkbox_id[index][option_index]].box[1];
        if(x2<this.token_cord_for_image[this.actual_checkbox_id[index][option_index]].box[2])
          x2 =this.token_cord_for_image[this.actual_checkbox_id[index][option_index]].box[2];
        if(y2<this.token_cord_for_image[this.actual_checkbox_id[index][option_index]].box[3])
          y2=this.token_cord_for_image[this.actual_checkbox_id[index][option_index]].box[3];
      
    }

    else if (type == 'question_checkbox') 
    {
      for (let i = 0; i < this.checkbox_question_id[index].length; i++)
      {
        if (x > this.token_cord_for_image[this.checkbox_question_id[index][i]].box[0])
          x = this.token_cord_for_image[this.checkbox_question_id[index][i]].box[0];
        if (y > this.token_cord_for_image[this.checkbox_question_id[index][i]].box[1])
          y = this.token_cord_for_image[this.checkbox_question_id[index][i]].box[1];
        if (x2 < this.token_cord_for_image[this.checkbox_question_id[index][i]].box[2])
          x2 = this.token_cord_for_image[this.checkbox_question_id[index][i]].box[2];
        if(y2 < this.token_cord_for_image[this.checkbox_question_id[index][i]].box[3])
          y2 =this.token_cord_for_image[this.checkbox_question_id[index][i]].box[3];
      }
    }

    if (x != 99999) 
    {
      this.display_entity_rect_ref.nativeElement.style.x = x;
      this.display_entity_rect_ref.nativeElement.style.y = y;

      this.display_entity_rect_ref.nativeElement.style.height = y2 - y;
      this.display_entity_rect_ref.nativeElement.style.width = x2 - x;

      if(type == 'actual_checkbox')
      {
        if(this.actual_checkbox_value[index][option_index]=="Checked")
        this.display_entity_rect_ref.nativeElement.style.fill = '#23875e';

        else
        this.display_entity_rect_ref.nativeElement.style.fill = 'none';
      }

      else
      this.display_entity_rect_ref.nativeElement.style.fill = 'none';


      //connecting-line stuff

      if (this.entity_connector_line != undefined) 
      {
        this.entity_connector_line.remove();
        this.entity_connector_line = undefined;
      }

      this.entity_connector_line = new LeaderLine(value_clicked,this.display_entity_rect_ref.nativeElement);
      this.entity_connector_line.size = 2.75;
      this.entity_connector_line.dash = true;
      this.entity_connector_line.path = 'grid';
      this.entity_connector_line.color = '#39a87a';
  }

  }


///////////////////////////////////////////////////// Common //////////////////////////////////////////////
  save_all_data(condition: number) 
  {
    // if (this.question_entity_strings.find((element) => element == '') !=undefined ||
    // this.answer_entity_strings.find((element) => element == '') != undefined) 
    // {
    //   this.toast.error({
    //     detail: 'ERROR',
    //     summary: 'The data is not corrected properly',
    //     duration: 3000,
    //   });
    //   return;
    // } 
    // else if (this.some_changes_done == 0)
    // {
    //   this.toast.error({
    //     detail: 'ERROR',
    //     summary: "You haven't made any change in data",
    //     duration: 3000,
    //   });
    //   return;
    // } 
    // else 
    // {
    //   this.toast.success({
    //     detail: 'SUCCESS',
    //     summary: "Your data is saved successful",
    //     duration: 3000,
    //   });
    // }

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
      for (let j = 0; j < this.question_entity_ids[i].length; j++) 
      {
        if (a > this.token_cord_for_cal[this.question_entity_ids[i][j]].box[0])
          a = this.token_cord_for_cal[this.question_entity_ids[i][j]].box[0];

        if (b > this.token_cord_for_cal[this.question_entity_ids[i][j]].box[1])
          b = this.token_cord_for_cal[this.question_entity_ids[i][j]].box[1];

        if (c < this.token_cord_for_cal[this.question_entity_ids[i][j]].box[2])
          c = this.token_cord_for_cal[this.question_entity_ids[i][j]].box[2];

        if (d < this.token_cord_for_cal[this.question_entity_ids[i][j]].box[3])
          d = this.token_cord_for_cal[this.question_entity_ids[i][j]].box[3];

        t.push({
          box: this.token_cord_for_cal[this.question_entity_ids[i][j]].box,
          text: this.token_cord_for_cal[this.question_entity_ids[i][j]].text,
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
      for (let j = 0; j < this.answer_entity_ids[i].length; j++) {
        if (a > this.token_cord_for_cal[this.answer_entity_ids[i][j]].box[0])
          a = this.token_cord_for_cal[this.answer_entity_ids[i][j]].box[0];

        if (b > this.token_cord_for_cal[this.answer_entity_ids[i][j]].box[1])
          b = this.token_cord_for_cal[this.answer_entity_ids[i][j]].box[1];

        if (c < this.token_cord_for_cal[this.answer_entity_ids[i][j]].box[2])
          c = this.token_cord_for_cal[this.answer_entity_ids[i][j]].box[2];

        if (d < this.token_cord_for_cal[this.answer_entity_ids[i][j]].box[3])
          d = this.token_cord_for_cal[this.answer_entity_ids[i][j]].box[3];

        t.push({
          box: this.token_cord_for_cal[this.answer_entity_ids[i][j]].box,
          text: this.token_cord_for_cal[this.answer_entity_ids[i][j]].text,
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

    for (let i = 0; i < this.header_entity_strings.length; i++) 
    {
      a = 99999;
      b = 99999;
      c = -1;
      d = -1;
      t = [];
      for (let j = 0; j < this.header_entity_ids[i].length; j++)
      {
        if (a > this.token_cord_for_cal[this.header_entity_ids[i][j]].box[0])
          a = this.token_cord_for_cal[this.header_entity_ids[i][j]].box[0];

        if (b > this.token_cord_for_cal[this.header_entity_ids[i][j]].box[1])
          b = this.token_cord_for_cal[this.header_entity_ids[i][j]].box[1];

        if (c < this.token_cord_for_cal[this.header_entity_ids[i][j]].box[2])
          c = this.token_cord_for_cal[this.header_entity_ids[i][j]].box[2];

        if (d < this.token_cord_for_cal[this.header_entity_ids[i][j]].box[3])
          d = this.token_cord_for_cal[this.header_entity_ids[i][j]].box[3];

        t.push({
          box: this.token_cord_for_cal[this.header_entity_ids[i][j]].box,
          text: this.token_cord_for_cal[this.header_entity_ids[i][j]].text,
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

    for (let i = 0; i < this.other_entity_strings.length; i++) 
    {
      a = 99999;
      b = 99999;
      c = -1;
      d = -1;
      t = [];
      for (let j = 0; j < this.other_entity_ids[i].length; j++) {
        if (a > this.token_cord_for_cal[this.other_entity_ids[i][j]].box[0])
          a = this.token_cord_for_cal[this.other_entity_ids[i][j]].box[0];

        if (b > this.token_cord_for_cal[this.other_entity_ids[i][j]].box[1])
          b = this.token_cord_for_cal[this.other_entity_ids[i][j]].box[1];

        if (c < this.token_cord_for_cal[this.other_entity_ids[i][j]].box[2])
          c = this.token_cord_for_cal[this.other_entity_ids[i][j]].box[2];

        if (d < this.token_cord_for_cal[this.other_entity_ids[i][j]].box[3])
          d = this.token_cord_for_cal[this.other_entity_ids[i][j]].box[3];

        t.push({
          box: this.token_cord_for_cal[this.other_entity_ids[i][j]].box,
          text: this.token_cord_for_cal[this.other_entity_ids[i][j]].text,
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

    let checkboxes:any[] = [];
    let questions:any[] = [];

    for(let z = 0; z<this.checkbox_question_id.length; z++)
    {
      for(let z2=0; z2 < this.option_string_id[z].length; z2++)
      {
        let token_index = [];
        
        let token_label = this.actual_checkbox_value[z][z2];
        // let 

        for(let z3 = 0; z3 < this.option_string_id[z][z2].length; z3++)
        {
          token_index.push(this.option_string_id[z][z2][z3]);
        }

        let obj = {
          'tl': { 'x': this.token_cord_for_cal[this.actual_checkbox_id[z][z2]].box[0], 'y': this.token_cord_for_cal[this.actual_checkbox_id[z][z2]].box[1]},
          'br': { 'x': this.token_cord_for_cal[this.actual_checkbox_id[z][z2]].box[2], 'y': this.token_cord_for_cal[this.actual_checkbox_id[z][z2]].box[3]},
          'label': token_label,
          'confidence': 1.0,
          'token_indexes': token_index,
          'question_id': z
        }
        
        checkboxes.push(obj);
      }

      let question_index = [];

      for(let z2 = 0; z2 < this.checkbox_question_id[z].length; z2++)
      {
        question_index.push(this.checkbox_question_id[z][z2]);
      }

      let ques = {
        'id': z,
        'token_indexes': question_index 
      }
      
      questions.push(ques);
    }


    console.log({"checkboxes": checkboxes, "questions": questions});
    

    //result contains updated kvpdata

    // let final = 
    // {
    //   _id: this.api_result._id,
    //   imgid: this.api_result.imgid,
    //   documentId: this.api_result.documentId,
    //   batchName: this.api_result.batchName,
    //   document_name: this.api_result.document_name,
    //   isCorrected: 'true',
    //   Type:"checkboxes",
    //   imageStatus: this.api_result.imageStatus,
    //   imagePath: this.api_result.imagePath,
    //   // kvpData: this.api_result.kvpData,
    //   correctedData: { 
    //     checkboxData:[],
    //     ocrData:result,
    //     kvpData:[]
    //    },
    //   correctedBy: '',
    //   correctedOn: '',
    // };
   // ################ update api call format ###### //
   let final:any;


   if(this.saving_data_result.type == "checkboxes"){

    final = 
     {
       "_id": this.saving_data_result._id,
       "imgid":this.saving_data_result.imgid,
       "documentId": this.saving_data_result.documentId,
       "batchName":this.saving_data_result.batchName,
       "document_name":this.saving_data_result.document_name,
       "isCorrected": "True",
       "imageStatus": this.saving_data_result.imageStatus,
       "imagePath": this.saving_data_result.imagePath,
       "type":this.saving_data_result.type,
       "Data": {
           "checkboxData": {},
           "ocrData":{},
           "kvpData":{}
       },
       "correctedData": {
           "checkboxData":{"checkboxes": checkboxes, "questions": questions},
           "ocrData":{"form":this.token_cord_for_cal},
           "kvpData":{}
       },
       "correctedBy": "",
       "correctedOn": ""
   }

          
     
  }

  else{

     final = 
     {
       "_id": this.saving_data_result._id,
       "imgid":this.saving_data_result.imgid,
       "documentId": this.saving_data_result.documentId,
       "batchName":this.saving_data_result.batchName,
       "document_name":this.saving_data_result.document_name,
       "isCorrected": "true",
       "imageStatus": this.saving_data_result.imageStatus,
       "imagePath": this.saving_data_result.imagePath,
       "type":this.saving_data_result.type,
       "Data": {
           "checkboxData": {},
           "ocrData":{},
           "kvpData":{}
       },
       "correctedData": {
           "checkboxData":[],
           "ocrData":{},
           "kvpData": {"form":result}
       },
       "correctedBy": "",
       "correctedOn": ""
   }

  }

   console.log(final);
   
    
    this.apiData.update_page_data(final).subscribe((data) => 
    {
      console.warn(data);
    });

    if (condition == 0) 
    {
      this.exit();
    } 
    else
    {
      this.doc_id++;
      window.sessionStorage.setItem('global_doc_id',this.doc_id);
      window.location.reload();
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

}
