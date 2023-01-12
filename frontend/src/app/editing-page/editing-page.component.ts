import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import 'leader-line';
import { ApiDataService } from '@app/services/api-data.service';
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

  selected_input_ref_field: any; //used to store ref to any selected input (add or edit input)
  selected_input_type_field: string = '';
  selected_input_index_field: number = -1;


  selected_input_ref_checkbox: any; //used to store ref to any selected input (add or edit input)
  selected_input_type_checkbox: string = '';
  selected_input_index_checkbox: number = -1;
  seleceted_input_option_index_checkbox: number = -1;

  custom_input_array1: number[] = [];
  custom_input_array2: number[] = [];

  entity_connector_line: any = undefined;
  some_changes_done:number=0;
  display_question_token:number=0;
  display_answer_token:number=0;
  display_header_token:number=0;
  display_other_token:number=0;

  custom_token_x:number=0;
  custom_token_y:number=0;
  custom_token_h:number=0;
  custom_token_w:number=0;

  custom_token_making=0;

  saving_data_result:any;

  ///////////////////////checkbox ka variable hai ye////////////////////////
  checkbox_question_string:string[] = [];
  checkbox_question_id:number[][] = [];

  options_string:string[][] = []; 
  options_string_id:number[][][] = []; 

  actual_checkbox_id:number[][] = [];
  actual_checkbox_value:string[][] = [];

  custom_option_array1:number[]=[];
  custom_option_array2:number[]=[];

  header_checkbox:number = 0;
  header_fields:number = 1;

  token_id_to_checkbox_question_index = new Map();

  /////////////// image control container variables /////////////////
  image_control_container_open: boolean = true;
  image_control_container_closed: boolean = false;



  constructor(private apiData: ApiDataService, private router:Router, private location:PlatformLocation, private toast:NgToastService)
  {
    
    this.apiData.docData = window.sessionStorage.getItem('global_doc_id');
    this.apiData.batchData = window.sessionStorage.getItem('global_batch_id');
    this.imageUrl = this.apiData.URL;

    this.doc_id = window.sessionStorage.getItem('global_doc_id');

    
    this.apiData.get_one_doc(this.apiData.batchData).subscribe((data)=>
    {
      this.apiData.docarray = data; 
    
    });
    
    this.apiData.get_pages(this.apiData.batchData, this.apiData.docData).subscribe((data) => 
    {    

      this.image_src = data[0].imagePath;
      this.saving_data_result = data[0]

      console.log(data);

      if(data[0].type == 'checkboxes')
      {
        if(data[0].isCorrected == 'true')
        {
          this.api_result=JSON.parse(JSON.stringify((data[0].correctedData.ocrData)));
          this.token_extractor_from_grouping(JSON.parse(JSON.stringify((data[0].correctedData.ocrData))));
          this.checkbox_label_initialization();
        }

        else
        {
          console.log(data[0].Data);
          
          this.api_result=JSON.parse(JSON.stringify((data[0].Data.ocrData)));
          this.token_extractor_from_grouping(JSON.parse(JSON.stringify((data[0].Data.ocrData))));
          this.checkbox_label_initialization();
        }
      }

      else
      {
        if(data[0].isCorrected == 'true')
        {
        this.api_result=JSON.parse(JSON.stringify((data[0].correctedData.kvpData.form)));
        this.token_extractor_from_grouping(JSON.parse(JSON.stringify((data[0].correctedData.kvpData.form))));
        this.kvp_label_initialization();
        }

        else
        {
        this.api_result=JSON.parse(JSON.stringify((data[0].Data.kvpData.form)));
        this.token_extractor_from_grouping(JSON.parse(JSON.stringify((data[0].Data.kvpData.form))));
        this.kvp_label_initialization();
        }    
      }

    });
     
    location.onPopState(() => 
    {
      if(this.entity_connector_line!=undefined)
      {
        this.entity_connector_line.remove();
        this.entity_connector_line=undefined;
      }
    });

    console.log(this.api_result);
    
  }

  ngAfterViewInit(): void 
  {
    setTimeout(()=>{
      this.image_height = this.image_ref.nativeElement.offsetHeight;
      this.image_width = this.image_ref.nativeElement.offsetWidth;
      
      this.viewport_image_adjuster();
      this.viewport_token_cord_adjuster();
      }, 1000);
  }
//////////////////////////////////// Common function for field and checkbox ///////////////////////////////

///////Image adjustment and data initialization function/////////

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


checkbox_label_initialization()
{

var dummy_token_id = -1;

console.log(this.cord_id_map);
console.log(this.token_id_to_checkbox_question_index);

  for(let i = 0; i<this.api_result.length; i++)
  {
    if(this.api_result[i].label == 'checkbox_question')
    {
      if(this.api_result[i].id > 0)
      {
      this.checkbox_question_string.push(this.api_result[i].text);

      var t:number[]=[];

        for(let j=0;j<this.api_result[i].words.length;j++)
        {
          t.push(this.cord_id_map.get(JSON.stringify(this.api_result[i].words[j].box)));
          this.used_token_map.set(t[t.length-1],1);
        }


      this.checkbox_question_id.push(t);

      this.token_id_to_checkbox_question_index.set(JSON.stringify(t), this.checkbox_question_id.length-1);
      }

      else
      {
        this.api_result[i].words[0].box = [dummy_token_id];
        this.cord_id_map.set(JSON.stringify([dummy_token_id]), dummy_token_id);

        this.checkbox_question_string.push("");
        var t:number[]=[dummy_token_id];
        dummy_token_id--;

        this.checkbox_question_id.push(t);
        this.token_id_to_checkbox_question_index.set(JSON.stringify(t), this.checkbox_question_id.length-1);
      }
    }
  }
  
  this.options_string.length = this.checkbox_question_id.length;
  this.options_string_id.length = this.checkbox_question_id.length;

  this.actual_checkbox_value.length = this.checkbox_question_id.length;
  this.actual_checkbox_id.length = this.checkbox_question_id.length;
  
  for(let i = 0; i<this.api_result.length; i++)
  {
    if(this.api_result[i].label == "checkbox_string" && this.api_result[i].question_id != "null")
    {
      for(let j = 0; j<this.api_result.length; j++)
      {
        if(this.api_result[i].question_id == this.api_result[j].id)
        {
          var t:number[]=[];

          for(let k=0;k<this.api_result[j].words.length;k++)
          {
            t.push(this.cord_id_map.get(JSON.stringify(this.api_result[j].words[k].box)));
          }
  
          // console.log(this.token_id_to_checkbox_question_index.get(JSON.stringify(t)));
          
          let question_index = this.token_id_to_checkbox_question_index.get(JSON.stringify(t));
          var t2:number[] = [];
          
          if(this.options_string[question_index] == undefined)
          {
            var str:string = "";

            for(let k=0; k<this.api_result[i].words.length; k++)
            {
              t2.push(this.cord_id_map.get(JSON.stringify(this.api_result[i].words[k].box)));
              this.used_token_map.set(t2[t2.length-1],1);

              if(str == "")
              str+=this.api_result[i].words[k].text;

              else
              str+= " " +this.api_result[i].words[k].text;
            }

            this.options_string_id[question_index] = [t2];
            this.options_string[question_index] = [str];

            str="";
          }

          else
          {
            var str="";

            for(let k=0; k<this.api_result[i].words.length; k++)
            {
              t2.push(this.cord_id_map.get(JSON.stringify(this.api_result[i].words[k].box)));
              this.used_token_map.set(t2[t2.length-1],1);

              if(str == "")
              str+=this.api_result[i].words[k].text;

              else
              str+= " " +this.api_result[i].words[k].text;
            }
            this.options_string[question_index].push(str);
            this.options_string_id[question_index].push(t2);

            str="";
          }
        }
      }
      
    }

    if(this.api_result[i].label == "checkbox" && this.api_result[i].question_id != "null")
    {
      for(let j = 0; j<this.api_result.length; j++)
      {
        if(this.api_result[i].question_id == this.api_result[j].id)
        {
          var t:number[]=[];

          for(let k=0;k<this.api_result[j].words.length;k++)
          {
            t.push(this.cord_id_map.get(JSON.stringify(this.api_result[j].words[k].box)));
          }
          
          let question_index = this.token_id_to_checkbox_question_index.get(JSON.stringify(t));
          var t2:number[] = [];

          if(this.actual_checkbox_value[question_index] == undefined)
          {
           
              t2.push(this.cord_id_map.get(JSON.stringify(this.api_result[i].words[0].box)));
              this.used_token_map.set(t2[t2.length-1],1);

              let l2 = t2[0];

            this.actual_checkbox_id[question_index] = [l2];

            if(this.api_result[i].check=='unchecked' || this.api_result[i].check=='Unchecked')
            this.actual_checkbox_value[question_index] = ['Unchecked'];

            else
            this.actual_checkbox_value[question_index] = ['Checked'];

          }

          else
          {
            t2.push(this.cord_id_map.get(JSON.stringify(this.api_result[i].words[0].box)));
            this.used_token_map.set(t2[t2.length-1],1);
      

            let l2 = t2[0];

            if(this.api_result[i].check=='unchecked' || this.api_result[i].check=='Unchecked')
            this.actual_checkbox_value[question_index].push('Unchecked');

            else
            this.actual_checkbox_value[question_index].push('Checked');

            this.actual_checkbox_id[question_index].push(l2);
          }
        }
      }
    }
  }   
}



token_extractor_from_grouping(data:any)
{

  let count=0;
  for(let i=0;i<data.length;i++)
  {
    if(data[i].id>=0)
    {
      for(let j=0;j<data[i].words.length;j++)
      {     

        this.token_cord_for_image.push(
          JSON.parse(JSON.stringify(
          {
            "box":data[i].words[j].box,
            "text":data[i].words[j].text,
            "id":count
          }))  
          );

        this.token_cord_for_cal.push(
          JSON.parse(JSON.stringify(
          {
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

///////////Token highlighter and custom token function/////////////

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
}

////////////////// Left side image control container ////////////
  
image_control_container()
{
  this.image_control_container_open = !this.image_control_container_open;
  this.image_control_container_closed = !this.image_control_container_closed;
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

  if (this.times >= 2.5) 
  return;

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

 image_token_click(token_id:number)
{
  if(this.used_token_map.has(token_id))
  {
    this.toast.warning({detail:"WARNING",summary:'This token has already been used',duration:5000});

    var id = "";

    for(let i = 0;i<this.question_entity_ids.length;i++)
    {
      for(let j = 0; j<this.question_entity_ids[i].length; j++)
      {
        if(token_id == this.question_entity_ids[i][j])
        {
          id = i+"q";
          break;
        }
      }
    }

    for(let i = 0;i<this.answer_entity_ids.length;i++)
    {
      for(let j = 0; j<this.answer_entity_ids[i].length; j++)
      {
        if(token_id == this.answer_entity_ids[i][j])
        {
          id = i+"a";
          break;
        }
      }
    }

    for(let i = 0;i<this.header_entity_ids.length;i++)
    {
      for(let j = 0; j<this.header_entity_ids[i].length; j++)
      {
        if(token_id == this.header_entity_ids[i][j])
        {
          id = i+"h";
          break;
        }
      }
    }

    for(let i = 0;i<this.other_entity_ids.length;i++)
    {
      for(let j = 0; j<this.other_entity_ids[i].length; j++)
      {
        if(token_id == this.other_entity_ids[i][j])
        {
          id = i+"o";
          break;
        }
      }
    }

    for(let i = 0; i<this.checkbox_question_id.length;i++)   {
      for(let j=0; j<this.checkbox_question_id[i].length; j++)
      {
        if(token_id == this.checkbox_question_id[i][j])
        {
          id = i+"ch";
          break;
        }
      }
    }
 
    var el = document.getElementById(id);
    el?.scrollIntoView();

    if(el != undefined)
    {
      el.style.borderColor = "#ffc107";

      setTimeout(()=>
      {
      if(el != undefined)
      el.style.borderColor = "#39a87a";
      }, 3000)
    }
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

    if (this.selected_input_type_field == 'q' || this.selected_input_type_field =='a' ||this.selected_input_type_field =='h' ||this.selected_input_type_field == 'o')
    {
      if (this.selected_input_type_field == 'q') 
      {
        this.used_token_map.set(token_id, 1);
        this.question_entity_ids[this.selected_input_index_field].push(token_id);
        this.question_entity_strings[this.selected_input_index_field]+= ' ' + this.token_cord_for_image[token_id].text;
      }

      else if (this.selected_input_type_field == 'a') 
      {
        this.used_token_map.set(token_id, 1);
        this.answer_entity_ids[this.selected_input_index_field].push(token_id);
        this.answer_entity_strings[this.selected_input_index_field] += ' ' + this.token_cord_for_image[token_id].text;
      }
      else if (this.selected_input_type_field == 'h') 
      {
        this.used_token_map.set(token_id, 1);
        this.header_entity_ids[this.selected_input_index_field].push(token_id);
        this.header_entity_strings[this.selected_input_index_field] += ' ' + this.token_cord_for_image[token_id].text;
      }
      else if (this.selected_input_type_field == 'o')
      {
        this.used_token_map.set(token_id, 1);
        this.other_entity_ids[this.selected_input_index_field].push(token_id);
        this.other_entity_strings[this.selected_input_index_field] += ' ' + this.token_cord_for_image[token_id].text;
      }
    }
    else if(this.selected_input_type_field == 'cq' || this.selected_input_type_field =='ca' ||this.selected_input_type_field =='ch' ||this.selected_input_type_field == 'co')
    {
      if (this.selected_input_type_field == 'ch')
      {
        this.used_token_map.set(token_id, 1);
        this.selected_input_ref_field.value += ' ' + this.token_cord_for_image[token_id].text;
        this.custom_input_array1.push(token_id);
      } 
      else if (this.selected_input_type_field == 'cq')
      {
        this.used_token_map.set(token_id, 1);
        this.selected_input_ref_field.value += ' ' + this.token_cord_for_image[token_id].text;
        this.custom_input_array1.push(token_id);
      }
      else if (this.selected_input_type_field == 'ca') 
      {
        this.used_token_map.set(token_id, 1);
        this.selected_input_ref_field.value += ' ' + this.token_cord_for_image[token_id].text;
        this.custom_input_array2.push(token_id);
      }
      else if (this.selected_input_type_field == 'co')
      {
        this.used_token_map.set(token_id, 1);
        this.selected_input_ref_field.value += ' ' + this.token_cord_for_image[token_id].text;
        this.custom_input_array1.push(token_id);
      }
    }
    
    else if(this.selected_input_type_checkbox == 'checkbox_option_string')
    {
      this.used_token_map.set(token_id, 1);
      this.options_string_id[this.selected_input_index_checkbox][this.seleceted_input_option_index_checkbox].push(token_id);
      this.options_string[this.selected_input_index_checkbox][this.seleceted_input_option_index_checkbox] += ' '+this.token_cord_for_image[token_id].text;
    }

    else if(this.selected_input_type_checkbox == 'checkbox_question' || this.selected_input_type_checkbox == 'custom_checkbox_option_string' || this.selected_input_type_checkbox == "custom_actual_checkbox_string")
    { 
      if(this.selected_input_type_checkbox == 'checkbox_question')
      {
        this.used_token_map.set(token_id, 1)
        // this.selected_input_ref.value += ' ' + this.token_cord_for_image[token_id].text;
        this.checkbox_question_string[this.selected_input_index_checkbox]+=' ' + this.token_cord_for_image[token_id].text;
        this.checkbox_question_id[this.selected_input_index_checkbox].push(token_id);
      }

      else if(this.selected_input_type_checkbox == 'custom_checkbox_option_string')
      {
        this.used_token_map.set(token_id, 1);
        this.selected_input_ref_checkbox.value += ' ' + this.token_cord_for_image[token_id].text;
        this.custom_option_array1.push(token_id);
      }

      else if(this.selected_input_type_checkbox == "custom_actual_checkbox_string")
      {
        this.used_token_map.set(token_id, 1)
        this.selected_input_ref_checkbox.value += 'Checkbox Selected';
        this.custom_option_array2.push(token_id);
      }
    } 
  }
} 

display_category_label(type:string)
{
  if(type=='q')
  {
    if(this.display_question_token==0) 
      this.display_question_token=1;
    else
    this.display_question_token=0; 
  }
  else if(type=='a')
  {
    if(this.display_answer_token==0) 
      this.display_answer_token=1;
    else
    this.display_answer_token=0;
  }
  else if(type=='h')
  {
    if(this.display_header_token==0) 
      this.display_header_token=1;
    else
    this.display_header_token=0;
  }
  else
  {
    if(this.display_other_token==0) 
      this.display_other_token=1;
    else
    this.display_other_token=0;
  }
}

////////////////////////////////////////////// Common Functions //////////////////////////////////////////////////////

entity_line_adjuster()
{
  if(this.entity_connector_line!=undefined)
  {
    this.entity_connector_line.position();
  }
}

show_fields_section(fields_border:any, checkboxes_border:any)
{
  fields_border.style.borderBottom = "7px solid #39a87a";
  checkboxes_border.style.borderBottom = "none";
  this.header_fields = 1;
  this.header_checkbox = 0;


  this.display_entity_rect_ref.nativeElement.style.x = 0;
  this.display_entity_rect_ref.nativeElement.style.y = 0;

  this.display_entity_rect_ref.nativeElement.style.height = 0;
  this.display_entity_rect_ref.nativeElement.style.width = 0;

  if(this.entity_connector_line!=undefined)
  {
    this.entity_connector_line.remove();
    this.entity_connector_line=undefined;
  }


  /////////remove selected input in checkbox section////////
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

show_checkboxes_section(fields_border:any, checkboxes_border:any)
{
  checkboxes_border.style.borderBottom = "7px solid #39a87a";
  fields_border.style.borderBottom = "none";
  this.header_fields = 0;
  this.header_checkbox = 1;


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
//////////////////////////////////////////////////////////Field Functions/////////////////////////////////////////////////////////////

select_field_for_editing(ref: any, type: any, index: number)
{
  this.selected_input_ref_field = ref;
  this.selected_input_type_field = type;
  this.selected_input_index_field = index;  
  
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

make_custom_field_entity()
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



next_button_click()
{
  this.clear_custom_field_input();
  this.clear_selected_field_input_ref();

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

  

clear_custom_field_input() 
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
  
  // clear_custom_field_input_cell() 
  // {
  //   if (this.selected_input_type == 'ch' ||this.selected_input_type == 'co' ||this.selected_input_type == 'cq')
  //   {
  //     for (let i = 0; i < this.custom_input_array1.length; i++) 
  //     {
  //       this.used_token_map.delete(this.custom_input_array1[i]);
  //     }

  //     this.custom_input_array1 = [];
  //     this.selected_input_ref.value = '';
  //   } 
  //   else
  //   {
  //     for (let i = 0; i < this.custom_input_array2.length; i++) 
  //     {
  //       this.used_token_map.delete(this.custom_input_array2[i]);
  //     }

  //     this.custom_input_array2 = [];
  //     this.selected_input_ref.value = '';
  //   }
  // }


clear_selected_field_input_ref()
{
  this.selected_input_ref_field = undefined;
  this.selected_input_type_field = '';
  this.selected_input_index_field = -1;
}

pop_token_from_field_entity()
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


  this.some_changes_done=1;

  if (this.selected_input_type_field == 'q') 
  {
      let remain_length=this.question_entity_ids[this.selected_input_index_field].length;

      if(remain_length==0)
      return;

      this.used_token_map.delete(this.question_entity_ids[this.selected_input_index_field][remain_length-1]);

      let deleted_token_id=this.question_entity_ids[this.selected_input_index_field][remain_length-1];
      this.question_entity_ids[this.selected_input_index_field].pop();

      var pos=this.question_entity_strings[this.selected_input_index_field].lastIndexOf(this.token_cord_for_image[deleted_token_id].text);

      this.question_entity_strings[this.selected_input_index_field]=
      this.question_entity_strings[this.selected_input_index_field].substring(0,pos)
      +
      this.question_entity_strings[this.selected_input_index_field].substring(pos+this.token_cord_for_image[deleted_token_id].text.length,this.question_entity_strings[this.selected_input_index_field].length);

      //check if only spaces left
      let space_count=0;
      for(let k=0;k<this.question_entity_strings[this.selected_input_index_field].length;k++)
      {
        if(this.question_entity_strings[this.selected_input_index_field][k]==' ')
        space_count++;
      }

      if(space_count==this.question_entity_strings[this.selected_input_index_field].length)
      this.question_entity_strings[this.selected_input_index_field]='';
  } 
  else if (this.selected_input_type_field == 'a')
  {
    let remain_length=this.answer_entity_ids[this.selected_input_index_field].length;

    if(remain_length==0)
    return;

    this.used_token_map.delete(this.answer_entity_ids[this.selected_input_index_field][remain_length-1]);

    let deleted_token_id=this.answer_entity_ids[this.selected_input_index_field][remain_length-1];
    this.answer_entity_ids[this.selected_input_index_field].pop();

    var pos=this.answer_entity_strings[this.selected_input_index_field].lastIndexOf(this.token_cord_for_image[deleted_token_id].text);

    this.answer_entity_strings[this.selected_input_index_field]=
    this.answer_entity_strings[this.selected_input_index_field].substring(0,pos)
    +
    this.answer_entity_strings[this.selected_input_index_field].substring(pos+this.token_cord_for_image[deleted_token_id].text.length,this.answer_entity_strings[this.selected_input_index_field].length);

    //check if only spaces left
    let space_count=0;
    for(let k=0;k<this.answer_entity_strings[this.selected_input_index_field].length;k++)
    {
      if(this.answer_entity_strings[this.selected_input_index_field][k]==' ')
      space_count++;
    }

    if(space_count==this.answer_entity_strings[this.selected_input_index_field].length)
    this.answer_entity_strings[this.selected_input_index_field]='';
  } 
  else if (this.selected_input_type_field == 'h') 
  {
    let remain_length=this.header_entity_ids[this.selected_input_index_field].length;

    if(remain_length==0)
    return;

    this.used_token_map.delete(this.header_entity_ids[this.selected_input_index_field][remain_length-1]);

    let deleted_token_id=this.header_entity_ids[this.selected_input_index_field][remain_length-1];
    this.header_entity_ids[this.selected_input_index_field].pop();

    var pos=this.header_entity_strings[this.selected_input_index_field].lastIndexOf(this.token_cord_for_image[deleted_token_id].text);

    this.header_entity_strings[this.selected_input_index_field]=
    this.header_entity_strings[this.selected_input_index_field].substring(0,pos)
    +
    this.header_entity_strings[this.selected_input_index_field].substring(pos+this.token_cord_for_image[deleted_token_id].text.length,this.header_entity_strings[this.selected_input_index_field].length);

    //check if only spaces left
    let space_count=0;
    for(let k=0;k<this.header_entity_strings[this.selected_input_index_field].length;k++)
    {
      if(this.header_entity_strings[this.selected_input_index_field][k]==' ')
      space_count++;
    }

    if(space_count==this.header_entity_strings[this.selected_input_index_field].length)
    this.header_entity_strings[this.selected_input_index_field]='';
  } 
  else if (this.selected_input_type_field == 'o')
  {
    let remain_length=this.other_entity_ids[this.selected_input_index_field].length;

    if(remain_length==0)
    return;

    this.used_token_map.delete(this.other_entity_ids[this.selected_input_index_field][remain_length-1]);

    let deleted_token_id=this.other_entity_ids[this.selected_input_index_field][remain_length-1];
    this.other_entity_ids[this.selected_input_index_field].pop();

    var pos=this.other_entity_strings[this.selected_input_index_field].lastIndexOf(this.token_cord_for_image[deleted_token_id].text);

    this.other_entity_strings[this.selected_input_index_field]=
    this.other_entity_strings[this.selected_input_index_field].substring(0,pos)
    +
    this.other_entity_strings[this.selected_input_index_field].substring(pos+this.token_cord_for_image[deleted_token_id].text.length,this.other_entity_strings[this.selected_input_index_field].length);

    //check if only spaces left
    let space_count=0;
    for(let k=0;k<this.other_entity_strings[this.selected_input_index_field].length;k++)
    {
      if(this.other_entity_strings[this.selected_input_index_field][k]==' ')
      space_count++;
    }

    if(space_count==this.other_entity_strings[this.selected_input_index_field].length)
    this.other_entity_strings[this.selected_input_index_field]='';
  }

  else if(this.selected_input_type_field == 'cq')
  {
    if(this.custom_input_array1.length == 0)
    return;

    else
    {

      this.used_token_map.delete(this.custom_input_array1[this.custom_input_array1.length-1]);
      this.custom_input_array1.pop();

      let t="";

      for(let i = 0; i<this.custom_input_array1.length; i++)
      {
        if(t == "")
        t += this.token_cord_for_image[this.custom_input_array1[i]].text;

        else
        t += " " + this.token_cord_for_image[this.custom_input_array1[i]].text;
      }

      this.selected_input_ref_field.value = t;
    }
  }

  else if(this.selected_input_type_field == 'ca')
  {
    if(this.custom_input_array2.length == 0)
    return;

    else
    {

      this.used_token_map.delete(this.custom_input_array2[this.custom_input_array2.length-1]);
      this.custom_input_array2.pop();

      let t="";

      for(let i = 0; i<this.custom_input_array2.length; i++)
      {
        if(t == "")
        t += this.token_cord_for_image[this.custom_input_array2[i]].text;

        else
        t += " " + this.token_cord_for_image[this.custom_input_array2[i]].text;
      }

      this.selected_input_ref_field.value = t;
    }
  }

  else if(this.selected_input_type_field == 'ch')
  {
    if(this.custom_input_array1.length == 0)
    return;

    else
    {

      this.used_token_map.delete(this.custom_input_array1[this.custom_input_array1.length-1]);
      this.custom_input_array1.pop();

      let t="";

      for(let i = 0; i<this.custom_input_array1.length; i++)
      {
        if(t == "")
        t += this.token_cord_for_image[this.custom_input_array1[i]].text;

        else
        t += " " + this.token_cord_for_image[this.custom_input_array1[i]].text;
      }

      this.selected_input_ref_field.value = t;
    }
  }

  else if(this.selected_input_type_field == 'co')
  {
    if(this.custom_input_array1.length == 0)
    return;

    else
    {

      this.used_token_map.delete(this.custom_input_array1[this.custom_input_array1.length-1]);
      this.custom_input_array1.pop();

      let t="";

      for(let i = 0; i<this.custom_input_array1.length; i++)
      {
        if(t == "")
        t += this.token_cord_for_image[this.custom_input_array1[i]].text;

        else
        t += " " + this.token_cord_for_image[this.custom_input_array1[i]].text;
      }

      this.selected_input_ref_field.value = t;
    }
  }
}

delete_field_entity(type:string,index:number)
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

field_entity_click(type: string, index: number, entity_ref: any)
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

///////////////////////////////////////////////////Checkbox section/////////////////////////////////////////////////////////////

create_new_checkbox_container()
{
  if(this.checkbox_question_string.length!= 0)
  {
    if(this.checkbox_question_string[this.checkbox_question_string.length-1]=="" && (this.options_string.length<this.checkbox_question_string.length || this.actual_checkbox_value.length<this.checkbox_question_string.length))
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


  ///////////////Remove leader line/////////////////
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

select_checkbox_for_editing(ref: any, type: any, question_index: number, option_index: number)
{
  this.selected_input_ref_checkbox = ref;
  this.selected_input_type_checkbox = type;
  this.selected_input_index_checkbox = question_index; 
  this.seleceted_input_option_index_checkbox = option_index; 
  
  if (type == 'checkbox_question' || type == 'custom_checkbox_option_string' || type == 'custom_actual_checkbox_string') 
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


add_checkbox_option_container(index:number, input_ref_clicked:any, actual_checkbox:any, checkbox_question_input_ref: any)
{
  if(this.custom_option_array1.length==0||this.custom_option_array2.length==0)
  {
    this.toast.warning({detail:"WARNING",summary:'Select all the tokens first to make checkbox entity',duration:5000});
  }

  else
  {
    if(index<this.options_string.length)
    { 
      let t="";
      for(let i=0;i<this.custom_option_array1.length;i++)
      {
        if(t=="")
        {
          t+=this.token_cord_for_image[this.custom_option_array1[i]].text;
          // console.log('1:' + this.options_string_id[index].length);
          
          if(this.options_string_id[index]==undefined)
          this.options_string_id[index] = [[this.custom_option_array1[i]]];  

          else
          this.options_string_id[index].push([this.custom_option_array1[i]]);  
        }

        else
        {
          t+=" "+this.token_cord_for_image[this.custom_option_array1[i]].text;
          // console.log('2:' + this.options_string_id[index].length);
          this.options_string_id[index][this.options_string_id[index].length-1].push(this.custom_option_array1[i]);
        }
      }
      
        if(this.options_string[index] == undefined)
        this.options_string[index] = [t];

        else
        this.options_string[index].push(t);
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

      this.options_string.push([t]);

      this.options_string_id.push([this.custom_option_array1]);

      this.custom_option_array1=[];
    }

    
    if(index<this.actual_checkbox_id.length)
    {
      for(let i=0;i<this.custom_option_array2.length;i++)
      {
        if(this.actual_checkbox_id[index] == undefined)
        this.actual_checkbox_id[index] = [this.custom_option_array2[i]];

        else
        this.actual_checkbox_id[index].push(this.custom_option_array2[i]);
      }

      if(this.actual_checkbox_value[index] == undefined)
      this.actual_checkbox_value[index] = ['Unchecked'];

      else
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
    
    console.log(this.options_string);
    console.log(this.options_string_id);

    input_ref_clicked.value = '';
    actual_checkbox.value = '';
  }
  
////////////////////////////Remove leader line/////////////////////////////////
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


checkbox_entity_click(type:string, index:number, option_index:number, value_clicked:any)
{  
  var x = 99999,
  y = 99999,
  x2 = -1,
  y2 = -1;

  if (type == 'checkbox_option_string') 
  {
    for (let i = 0; i < this.options_string_id[index][option_index].length; i++) 
    {
      if(x>this.token_cord_for_image[this.options_string_id[index][option_index][i]].box[0])
        x=this.token_cord_for_image[this.options_string_id[index][option_index][i]].box[0];
      if(y>this.token_cord_for_image[this.options_string_id[index][option_index][i]].box[1])
        y=this.token_cord_for_image[this.options_string_id[index][option_index][i]].box[1];
      if(x2<this.token_cord_for_image[this.options_string_id[index][option_index][i]].box[2])
        x2 =this.token_cord_for_image[this.options_string_id[index][option_index][i]].box[2];
      if(y2 <this.token_cord_for_image[this.options_string_id[index][option_index][i]].box[3])
        y2 =this.token_cord_for_image[this.options_string_id[index][option_index][i]].box[3];
    }
  }

  else if (type == 'actual_checkbox_string') 
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

  else if (type == 'checkbox_question') 
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

    if(type == 'actual_checkbox_string')
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

actual_checkbox_checkbox_clicked(index: number, j:number)
{
  if(this.actual_checkbox_value[index][j] == "Unchecked")
  {
    this.actual_checkbox_value[index][j] = "Checked";
  }

  else
  {
    this.actual_checkbox_value[index][j] = "Unchecked";
  }

  ////////////////////////////////////Remove leader line//////////////////////////////////////////////
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

pop_from_checkbox_entity()
{

  if(this.selected_input_type_checkbox == "checkbox_question" || this.selected_input_type_checkbox == "checkbox_option_string")
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
    
  if(this.selected_input_type_checkbox == "checkbox_question")
  {
    if(this.checkbox_question_id[this.selected_input_index_checkbox].length == 0)
    return;


    let last_index = this.checkbox_question_id[this.selected_input_index_checkbox][this.checkbox_question_id[this.selected_input_index_checkbox].length-1];
    this.checkbox_question_id[this.selected_input_index_checkbox].pop()

    this.used_token_map.delete(last_index);

    this.checkbox_question_string[this.selected_input_index_checkbox] = "";

    console.log(this.checkbox_question_string[this.selected_input_index_checkbox])

    let t = "";

    for(let i = 0; i<this.checkbox_question_id[this.selected_input_index_checkbox].length; i++)
    {
      if(t == "")
      t += this.token_cord_for_image[this.checkbox_question_id[this.selected_input_index_checkbox][i]].text;

      else
      t += " "+this.token_cord_for_image[this.checkbox_question_id[this.selected_input_index_checkbox][i]].text;
    }
     
    this.checkbox_question_string[this.selected_input_index_checkbox] = t;
  }

  else if(this.selected_input_type_checkbox == "checkbox_option_string")
  {
    if(this.options_string_id[this.selected_input_index_checkbox][this.seleceted_input_option_index_checkbox].length == 0)
    return;

    let last_index = this.options_string_id[this.selected_input_index_checkbox][this.seleceted_input_option_index_checkbox][this.options_string_id[this.selected_input_index_checkbox][this.seleceted_input_option_index_checkbox].length-1];
    this.options_string_id[this.selected_input_index_checkbox][this.seleceted_input_option_index_checkbox].pop()

    this.used_token_map.delete(last_index);

    this.options_string[this.selected_input_index_checkbox][this.seleceted_input_option_index_checkbox] = "";

      // console.log(this.checkbox_question_string[this.selected_input_index])

    let t = "";

    for(let i = 0; i<this.options_string_id[this.selected_input_index_checkbox][this.seleceted_input_option_index_checkbox].length; i++)
    {
      if(t == "")
      t += this.token_cord_for_image[this.options_string_id[this.selected_input_index_checkbox][this.seleceted_input_option_index_checkbox][i]].text;

      else
      t += " "+this.token_cord_for_image[this.options_string_id[this.selected_input_index_checkbox][this.seleceted_input_option_index_checkbox][i]].text;
    }

    this.options_string[this.selected_input_index_checkbox][this.seleceted_input_option_index_checkbox] = t;
  }

  else if(this.selected_input_type_checkbox == 'custom_checkbox_option_string')
  {
    if(this.custom_option_array1.length == 0)
    return;

    else
    {
      this.used_token_map.delete(this.custom_option_array1[this.custom_option_array1.length-1]);
      this.custom_option_array1.pop();

      let t="";

      for(let i = 0; i<this.custom_option_array1.length; i++)
      {
        if(t == "")
        t += this.token_cord_for_image[this.custom_option_array1[i]].text;

        else
        t += " " + this.token_cord_for_image[this.custom_option_array1[i]].text;
      }

      this.selected_input_ref_checkbox.value = t;
    }
  }

  else if(this.selected_input_type_checkbox == "custom_actual_checkbox_string")
  {
    if(this.custom_option_array2.length == 0)
    return;

    else
    {
      this.used_token_map.delete(this.custom_option_array2[this.custom_option_array2.length-1]);
      this.custom_option_array2.pop();

      let t="";

      for(let i = 0; i<this.custom_option_array2.length; i++)
      {
        if(t == "")
        t += "Checkbox Selected";

        else
        t += " Checkbox Selected";
      }

      this.selected_input_ref_checkbox.value = t;
    }
  }

}


delete_checkbox_option(question_index:number, checkbox_index:number)
{
  this.used_token_map.delete(this.actual_checkbox_id[question_index][checkbox_index]);

  for(let j = 0; j<this.options_string_id[question_index][checkbox_index].length; j++)
  {
    this.used_token_map.delete(this.options_string_id[question_index][checkbox_index][j]);
  }

  this.options_string[question_index].splice(checkbox_index, 1);
  this.options_string_id[question_index].splice(checkbox_index, 1);
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



delete_checkbox_question(index:number)
{
    
  if(this.checkbox_question_id.length>index)
  {
    for(let i = 0; i<this.checkbox_question_id[index].length; i++)
    {
      this.used_token_map.delete(this.checkbox_question_id[index][i]);
    }
  }

  if(this.options_string_id[index] != undefined)
  {
    console.log(this.options_string[0]);
    console.log(this.options_string_id[0]);
    
    
    for(let i = 0; i<this.options_string_id[index].length; i++)
    {
      for(let j = 0; j<this.options_string_id[index][i].length; j++)
      {
        this.used_token_map.delete(this.options_string_id[index][i][j]);
      }
    }
  }

  if(this.actual_checkbox_id[index] != undefined)
  {
    for(let i = 0; i<this.actual_checkbox_id[index].length; i++)
    {
      this.used_token_map.delete(this.actual_checkbox_id[index][i]);
    }
  }

    // for(let i = 0; i<this.actual_checkbox_id[index].length; i++)
    // this.used_token_map.delete(this.option_string_id[index][i]);

  if(this.options_string_id.length>index)
  {
    this.options_string.splice(index, 1);
    this.options_string_id.splice(index, 1);
  }

  if(this.actual_checkbox_id.length>index)
  {
    this.actual_checkbox_value.splice(index, 1);
    this.actual_checkbox_id.splice(index, 1);
  }

  this.checkbox_question_string.splice(index, 1);
  this.checkbox_question_id.splice(index, 1);  

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






///////////////////////////////////////////////Common function//////////////////////////////////////////////

save_all_data(condition: number) 
{
  // if (this.question_entity_strings.find((element) => element == '') !=undefined || this.answer_entity_strings.find((element) => element == '') != undefined) 
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
    for (let j = 0; j < this.answer_entity_ids[i].length; j++) 
    {
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
    for(let z2 = 0; z2 < this.options_string_id[z].length; z2++)
    {
      let token_index = [];
      
      let token_label = this.actual_checkbox_value[z][z2];

      let obj;
     
      for(let z3 = 0; z3 < this.options_string_id[z][z2].length; z3++)
      {
        token_index.push(this.options_string_id[z][z2][z3]);
      }
      
      // if(this.checkbox_question_string[z] == "")
      // {
      //   obj = {
      //     'tl': { 'x': this.token_cord_for_cal[this.actual_checkbox_id[z][z2]].box[0], 'y': this.token_cord_for_cal[this.actual_checkbox_id[z][z2]].box[1]},
      //     'br': { 'x': this.token_cord_for_cal[this.actual_checkbox_id[z][z2]].box[2], 'y': this.token_cord_for_cal[this.actual_checkbox_id[z][z2]].box[3]},
      //     'label': token_label,
      //     'confidence': 1.0,
      //     'token_indexes': token_index,
      //     'question_id': null
      //   }
      // }

      // else
      // {
        obj = {
          'tl': { 'x': this.token_cord_for_cal[this.actual_checkbox_id[z][z2]].box[0], 'y': this.token_cord_for_cal[this.actual_checkbox_id[z][z2]].box[1]},
          'br': { 'x': this.token_cord_for_cal[this.actual_checkbox_id[z][z2]].box[2], 'y': this.token_cord_for_cal[this.actual_checkbox_id[z][z2]].box[3]},
          'label': token_label,
          'confidence': 1.0,
          'token_indexes': token_index,
          'question_id': z
        }
      // }
      
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


  // console.log({"checkboxes": checkboxes, "questions": questions});
    
  let final:any;

  if(this.saving_data_result.type == "checkboxes")
  {

    final = {
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
          "checkboxData":{"checkboxes": checkboxes, "questions": questions},
          "ocrData":{"form":this.token_cord_for_cal},
          "kvpData":{}
      },
      "correctedBy": "",
      "correctedOn": ""
    }
  }

  else
  {
    final = {
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

    console.log("#######final",final);
   
    
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
    for(let i=0;i<this.apiData.docarray.length;i++)
    {    
      if(this.apiData.docarray[Number(i)].documentId == this.doc_id)
      {

        if(i == this.apiData.docarray.length - 1 )
        {
          this.doc_id = this.apiData.docarray[0].documentId;
          window.sessionStorage.setItem('global_doc_id',this.doc_id);
          window.location.reload();
        }

        else{// console.log(this.apiData.docarray[Number(i)+1])
            this.doc_id = this.apiData.docarray[Number(i)+1].documentId;
            window.sessionStorage.setItem('global_doc_id',this.doc_id);
            window.location.reload();
        }
        break
      }
    }
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
