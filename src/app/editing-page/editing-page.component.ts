import { Component,ViewChild } from '@angular/core';
import cord1 from 'src/assets/page1.json';

@Component({
  selector: 'app-editing-page',
  templateUrl: './editing-page.component.html',
  styleUrls: ['./editing-page.component.css']
})
export class EditingPageComponent 
{
  @ViewChild('header_input_ref') header_input_ref:any;
  @ViewChild('question_input_ref') question_input_ref:any;
  @ViewChild('answer_input_ref') answer_input_ref:any;

  title:string="";
  selected_input_name:string="";
  entity_type_button:string="Header";
  coordinate_array:any=cord1.ocrCoordinates;

  // question_input_index:number[]=[];
  question_array:string[]=[];
  // answer_input_index:number[]=[];
  answer_array:string[]=[];
  // header_input_index:number[]=[];
  header_array:string[]=[];

  ngAfterViewInit(): void{
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
        // this.header_input_index.push(data);
        this.header_input_ref.nativeElement.value+= " " + this.coordinate_array[data].word;
      }
      else
      {
        // this.header_input_index=[];
        // this.header_input_index.push(data);
        this.header_input_ref.nativeElement.value+=this.coordinate_array[data].word;
      }
    }
    else if(this.selected_input_name=='question')
    {
      if(this.question_input_ref.nativeElement.value!="")
      {
        // this.question_input_index.push(data);
        this.question_input_ref.nativeElement.value+= " " + this.coordinate_array[data].word;
      }
      else
      {
        // this.question_input_index=[];
        // this.question_input_index.push(data);
        this.question_input_ref.nativeElement.value+=this.coordinate_array[data].word;
      }
    }
    else if(this.selected_input_name=='answer')
    {
      if(this.answer_input_ref.nativeElement.value!="")
      {
        // this.answer_input_index.push(data);
        this.answer_input_ref.nativeElement.value+= " " + this.coordinate_array[data].word;
      }
      else
      {
        // this.answer_input_index=[];
        // this.answer_input_index.push(data);
        this.answer_input_ref.nativeElement.value+=this.coordinate_array[data].word;
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
        this.question_input_ref.nativeElement.value="";
        this.answer_array.push(this.answer_input_ref.nativeElement.value);
        this.answer_input_ref.nativeElement.value="";
      }
    }
  }
  delete_entity(ind:number,t:string)
  {
     if(t=='H')
     {
      this.header_array.splice(ind,1);
     }
     else
     {
      this.question_array.splice(ind,1);
      this.answer_array.splice(ind,1);
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

}
