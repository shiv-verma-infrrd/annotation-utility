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

      // console.log(data[0]);

      if(data[0].type == 'checkboxes')
      {
        if(data[0].isCorrected == 'true')
        {
          this.api_result=JSON.parse(JSON.stringify((data[0].correctedData.ocrData)));
          this.token_extractor_from_grouping(JSON.parse(JSON.stringify((data[0].correctedData.ocrData))));
          // this.ocr_label_initialization();
          console.log("checkboxes being called");
        }

        else
        {
          console.log(data[0].Data);
          
          this.api_result=JSON.parse(JSON.stringify((data[0].Data.ocrData)));
          this.token_extractor_from_grouping(JSON.parse(JSON.stringify((data[0].Data.ocrData))));
          // this.ocr_label_initialization();
          console.log("checkboxes being called");
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


token_extractor_from_grouping(data:any)
{
  let count=0;
  for(let i=0;i<data.length;i++)
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

 entity_line_adjuster()
 {
  if(this.entity_connector_line!=undefined)
  {
    this.entity_connector_line.position();
  }
 }

 image_token_click(token_id:number)
{
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
  }
 }
}
