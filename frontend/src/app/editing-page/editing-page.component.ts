import { AfterViewInit, Component,ViewChild } from '@angular/core';
import cord1 from 'src/assets/page1.json';
import { ApiDataService } from '../services/api-data.service';
@Component({
  selector: 'app-editing-page',
  templateUrl: './editing-page.component.html',
  styleUrls: ['./editing-page.component.css']
})
export class EditingPageComponent implements AfterViewInit
{
  @ViewChild('header_input_ref') header_input_ref:any;
  @ViewChild('question_input_ref') question_input_ref:any;
  @ViewChild('answer_input_ref') answer_input_ref:any;
  @ViewChild('i_r') img_ref: any;
  @ViewChild('sv') svg_ref: any;
  @ViewChild('entity_rect_ref') entity_rect_ref:any;

  constructor(private apiData: ApiDataService) { 
    
    apiData.get_ocr_data("638fad525d2501fd2fa5ae41").subscribe((data)=>{
      
      console.warn("ocr Data : ",data);
      // this.apiDocuments = data;
    })
  }

  title:string="";
  selected_input_name:string="";
  entity_type_button:string="Header";
  coordinate_array:any=cord1.form;

  img_length: number=0;
  img_width: number=0;

  l: number = 0;
  c: number = 0;

  times:number=1;

  temp_array_1:number[]=[];
  temp_array_2:number[]=[];

  question_input_index:number[][]=[];
  question_array:string[]=[];
  
  answer_input_index:number[][]=[];
  answer_array:string[]=[];
  
  header_input_index:number[][]=[];
  header_array:string[]=[];

  ngAfterViewInit(): void{
   
    setTimeout(()=>{
      this.img_length=this.img_ref.nativeElement.offsetHeight;
      this.img_width=this.img_ref.nativeElement.offsetWidth;
      this.l=this.img_ref.nativeElement.offsetHeight;
      this.c=this.img_ref.nativeElement.offsetWidth;
    },1000);
  }

  token_mouse_enter(data:any)
  {
    data.stroke="#39a87a";
  }

  token_mouse_out(data:any)
  {
    data.stroke="";
  }

  token_click(data:any)
  {
    if(this.selected_input_name=='header') 
    {
      if(this.header_input_ref.nativeElement.value!="")
      {
        this.temp_array_1.push(data);
        this.header_input_ref.nativeElement.value+= " " + this.coordinate_array[data].text;
      }
      else
      {
        this.temp_array_1=[];
        this.temp_array_1.push(data);
        this.header_input_ref.nativeElement.value+=this.coordinate_array[data].text;
      }
    }
    else if(this.selected_input_name=='question')
    {
      if(this.question_input_ref.nativeElement.value!="")
      {
        this.temp_array_1.push(data);
        this.question_input_ref.nativeElement.value+= " " + this.coordinate_array[data].text;
      }
      else
      {
        this.temp_array_1=[];
        this.temp_array_1.push(data);
        this.question_input_ref.nativeElement.value+=this.coordinate_array[data].text;
      }
    }
    else if(this.selected_input_name=='answer')
    {
      if(this.answer_input_ref.nativeElement.value!="")
      {
        this.temp_array_2.push(data);
        this.answer_input_ref.nativeElement.value+= " " + this.coordinate_array[data].text;
      }
      else
      {
        this.temp_array_2=[];
        this.temp_array_2.push(data);
        this.answer_input_ref.nativeElement.value+=this.coordinate_array[data].text;
      }
    }
  }

  next_button_click()
  {
    this.selected_input_name="";// stop adding token on selecting new entity type

    if(this.entity_type_button=='Header')
    {
      this.entity_type_button='Q&A';
      this.question_input_ref.nativeElement.style.display="block";
      this.answer_input_ref.nativeElement.style.display="block";
      this.header_input_ref.nativeElement.style.display="none";
    }
    else
    {
      this.entity_type_button='Header';
      this.header_input_ref.nativeElement.style.display="block";
      this.question_input_ref.nativeElement.style.display="none";
      this.answer_input_ref.nativeElement.style.display="none";
    }
  }

  select_input(input_type:any)
  {
    this.entity_rect_ref.nativeElement.style.height=0;
    this.entity_rect_ref.nativeElement.style.width=0;
    
    this.selected_input_name=input_type; 
  }

  submit_entity()
  {
    if(this.entity_type_button=='Header')
    {
      if(this.header_input_ref.nativeElement.value=="")
      {
        alert("make a header entity first to submit");
      }
      else
      {
        // console.log(this.header_input_index);
        this.header_array.push(this.header_input_ref.nativeElement.value);
        this.header_input_index.push(this.temp_array_1);

        this.temp_array_1=[];
        this.header_input_ref.nativeElement.value="";
      }
    }
    else
    {
      if(this.question_input_ref.nativeElement.value==""||this.answer_input_ref.nativeElement.value=="")
      {
        alert("make a question and answer entity first to submit");
      }
      else
      {
        // console.log(this.question_input_index);
        // console.log(this.answer_input_index);
        this.question_array.push(this.question_input_ref.nativeElement.value);
        this.question_input_index.push(this.temp_array_1);
        this.temp_array_1=[];
        this.question_input_ref.nativeElement.value="";

        this.answer_array.push(this.answer_input_ref.nativeElement.value);
        this.answer_input_index.push(this.temp_array_2);
        this.temp_array_2=[];
        this.answer_input_ref.nativeElement.value="";
      }
    }
  }
  delete_entity(ind:number,t:string)
  {
    this.entity_rect_ref.nativeElement.style.height=0;
    this.entity_rect_ref.nativeElement.style.width=0;

     if(t=='H')
     {
      this.header_array.splice(ind,1);
      this.header_input_index.splice(ind,1);
     }
     else
     {
      this.question_array.splice(ind,1);
      this.answer_array.splice(ind,1);
      this.question_input_index.splice(ind,1);
      this.answer_input_index.splice(ind,1);
     }
  }
  clear_input(type:any)
  {
     if(type=='h')
     this.header_input_ref.nativeElement.value="";
     else if(type=='q')
     this.question_input_ref.nativeElement.value="";
     else
     this.answer_input_ref.nativeElement.value="";
  }
  
  zoom_in() {
    if (this.times >= 2.5) return;

    this.times += 0.2;

    this.img_ref.nativeElement.style.height = this.l * this.times + 'px';
    this.img_ref.nativeElement.style.width = this.c * this.times + 'px';

    this.img_length = this.l * this.times;
    this.img_width = this.c * this.times;

    for (let i = 0; i < this.coordinate_array.length; i++) {
      this.coordinate_array[i].box[0] = (cord1.form[i].box[0]/(this.times-0.2)) * this.times;
      this.coordinate_array[i].box[1] = (cord1.form[i].box[1]/(this.times-0.2)) * this.times;
      this.coordinate_array[i].box[2] = (cord1.form[i].box[2]/(this.times-0.2)) * this.times;
      this.coordinate_array[i].box[3]= (cord1.form[i].box[3]/(this.times-0.2)) * this.times;
    }
  }

  zoom_out() {

    this.times -= 0.2;

    this.img_ref.nativeElement.style.height = this.l * this.times + 'px';
    this.img_ref.nativeElement.style.width = this.c * this.times + 'px';

    this.img_length = this.l * this.times;
    this.img_width = this.c * this.times;

   
    for (let i = 0; i < this.coordinate_array.length; i++) {
      this.coordinate_array[i].box[0] = (cord1.form[i].box[0]/(this.times+0.2)) * this.times;
      this.coordinate_array[i].box[1] = (cord1.form[i].box[1]/(this.times+0.2)) * this.times;
      this.coordinate_array[i].box[2] = (cord1.form[i].box[2]/(this.times+0.2)) * this.times;
      this.coordinate_array[i].box[3]= (cord1.form[i].box[3]/(this.times+0.2)) * this.times;
    }
  }

  entity_click(type:string,index:number)
  {
    var x=999,y=999,x2=-1,y2=-1;
     if(type=='q')
     { 
     for(let i=0;i<this.question_input_index[index].length;i++)
     {
      if(x>this.coordinate_array[this.question_input_index[index][i]].box[0]) 
       x=this.coordinate_array[this.question_input_index[index][i]].box[0]; 
      
      if(y>this.coordinate_array[this.question_input_index[index][i]].box[1]) 
       y=this.coordinate_array[this.question_input_index[index][0]].box[1];

      if(x2<this.coordinate_array[this.question_input_index[index][i]].box[2])  
      x2=this.coordinate_array[this.question_input_index[index][i]].box[2]

      if(y2<this.coordinate_array[this.question_input_index[index][i]].box[3])  
      y2=this.coordinate_array[this.question_input_index[index][i]].box[3]
     }
     }
     else if(type=='a')
     {  
      for(let i=0;i<this.answer_input_index[index].length;i++)
      {
       if(x>this.coordinate_array[this.answer_input_index[index][i]].box[0]) 
        x=this.coordinate_array[this.answer_input_index[index][i]].box[0]; 
       
       if(y>this.coordinate_array[this.answer_input_index[index][i]].box[1]) 
        y=this.coordinate_array[this.answer_input_index[index][0]].box[1];
 
       if(x2<this.coordinate_array[this.answer_input_index[index][i]].box[2])  
       x2=this.coordinate_array[this.answer_input_index[index][i]].box[2]
 
       if(y2<this.coordinate_array[this.answer_input_index[index][i]].box[3])  
       y2=this.coordinate_array[this.answer_input_index[index][i]].box[3]
      }
     }
     else
     { 
      for(let i=0;i<this.header_input_index[index].length;i++)
      {
       if(x>this.coordinate_array[this.header_input_index[index][i]].box[0]) 
        x=this.coordinate_array[this.header_input_index[index][i]].box[0]; 
       
       if(y>this.coordinate_array[this.header_input_index[index][i]].box[1]) 
        y=this.coordinate_array[this.header_input_index[index][0]].box[1];
 
       if(x2<this.coordinate_array[this.header_input_index[index][i]].box[2])  
       x2=this.coordinate_array[this.header_input_index[index][i]].box[2]
 
       if(y2<this.coordinate_array[this.header_input_index[index][i]].box[3])  
       y2=this.coordinate_array[this.header_input_index[index][i]].box[3]
      } 
     }

     this.entity_rect_ref.nativeElement.style.x=x;
     this.entity_rect_ref.nativeElement.style.y=y;
     
     this.entity_rect_ref.nativeElement.style.height=y2-y;
     this.entity_rect_ref.nativeElement.style.width=x2-x;
  }
}
