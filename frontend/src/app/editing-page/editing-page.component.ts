import { AfterViewInit, Component,ViewChild} from '@angular/core';
import { ApiDataService } from '../services/api-data.service';
@Component({
  selector: 'app-editing-page',
  templateUrl: './editing-page.component.html',
  styleUrls: ['./editing-page.component.css']
})
export class EditingPageComponent implements AfterViewInit
{
  @ViewChild('custom_header_input_ref') custom_header_input_ref:any;
  @ViewChild('custom_question_input_ref') custom_question_input_ref:any;
  @ViewChild('custom_answer_input_ref') custom_answer_input_ref:any;
  @ViewChild('custom_other_input_ref') custom_other_input_ref:any;
  @ViewChild('main_image_ref') img_ref: any;
  @ViewChild('svg_ref') svg_ref: any;
  
  imgUrl:any;
  image_url:any;
  coordinate_array:any;
  json_input:any;

  img_length: number=0;
  img_width: number=0;
  times:number=1;
  l:number=0;
  c:number=0;

  custom_input_type:any="Header";

  selected_input_ref:any;//used to store ref to any selected input (add or edit input)
  selected_input_type:string="";
  selected_input_index:number=-1;

  custom_input_array1:number[]=[];
  custom_input_array2:number[]=[];

  header_entity_strings:string[]=[];
  header_entity_indexs:number[][]=[];

  other_entity_strings:string[]=[];
  other_entity_indexs:number[][]=[];
  
  question_entity_strings:string[]=[];
  question_entity_indexs:number[][]=[];
  
  answer_entity_strings:string[]=[];
  answer_entity_indexs:number[][]=[];

  used_token_map=new Map();

    constructor(private apiData: ApiDataService)
  {
      this.apiData.docData = localStorage.getItem('global_doc_id')
      this.apiData.batchData = localStorage.getItem('global_batch_id')
      this.imgUrl = this.apiData.URL
      this.apiData.get_pages(this.apiData.batchData,this.apiData.docData).subscribe((data)=>{
            
        this.image_url = data[0].imagePath;
        this.json_input = data[0].kvpData.form;
        this.coordinate_array=data[0].kvpData.form;

        this.token_label_intialization();   
    });
  }

  ngAfterViewInit(): void
  {
    setTimeout(()=>{
      this.set_svg_dimensions();
    },1000);
  }

  set_svg_dimensions()
  {
    this.img_length=this.img_ref.nativeElement.offsetHeight;
    this.img_width=this.img_ref.nativeElement.offsetWidth;
    this.l=this.img_ref.nativeElement.offsetHeight;
    this.c=this.img_ref.nativeElement.offsetWidth;
  }

  token_label_intialization()
  {
    for(let i=0;i<this.json_input.length;i++)
    { 
      if(this.json_input[i].label=='header')
      {
        this.used_token_map.set(this.json_input[i].id,1);
        this.header_entity_strings.push(this.json_input[i].text);
        this.header_entity_indexs.push([this.json_input[i].id]);
      }
      else if(this.json_input[i].label=='other')
      {
        this.used_token_map.set(this.json_input[i].id,1);
        this.other_entity_strings.push(this.json_input[i].text);
        this.other_entity_indexs.push([this.json_input[i].id]);
      }
      else if(this.json_input[i].label=='question')
      {
        this.used_token_map.set(this.json_input[i].id,1);
        this.question_entity_strings.push(this.json_input[i].text);
        this.question_entity_indexs.push([this.json_input[i].id]);
        this.answer_entity_strings.push("");
        this.answer_entity_indexs.push([]);
      }
      else if(this.json_input[i].label=='answer')
      {
        this.used_token_map.set(this.json_input[i].id,1);
        this.answer_entity_strings.push(this.json_input[i].text);
        this.answer_entity_indexs.push([this.json_input[i].id]);
        this.question_entity_strings.push("");
        this.question_entity_indexs.push([]);
      }
    }
  }

  image_token_click(id:number)
  {
    if(this.used_token_map.has(id))
    {
      alert("this token is already used");
    }
    else
    { 
     if(this.selected_input_type=='q'||this.selected_input_type=='a'||this.selected_input_type=='h'
     ||this.selected_input_type=='o')
     { 
      if(this.selected_input_type=='q')
      {
        this.used_token_map.set(id,1);
        this.question_entity_indexs[this.selected_input_index].push(id);
        this.question_entity_strings[this.selected_input_index]+=" "+this.json_input[id].text;
      }
      else if(this.selected_input_type=='a')
      {
        this.used_token_map.set(id,1);
        this.answer_entity_indexs[this.selected_input_index].push(id);
        this.answer_entity_strings[this.selected_input_index]+=" "+this.json_input[id].text;
      }
      else if(this.selected_input_type=='h')
      {
        this.used_token_map.set(id,1);
        this.header_entity_indexs[this.selected_input_index].push(id);
        this.header_entity_strings[this.selected_input_index]+=" "+this.json_input[id].text;
      }
      else if(this.selected_input_type=='o')
      {
        this.used_token_map.set(id,1);
        this.other_entity_indexs[this.selected_input_index].push(id);
        this.other_entity_strings[this.selected_input_index]+=" "+this.json_input[id].text;
      }
     }
     else
     {
      // need to add string in inpt and index in array
      if(this.selected_input_type=='ch')
      {
        this.used_token_map.set(id,1);
        this.selected_input_ref.value+=" "+this.json_input[id].text;
        this.custom_input_array1.push(id);
      }
      else if(this.selected_input_type=='cq')
      {
        this.used_token_map.set(id,1);
        this.selected_input_ref.value+=" "+this.json_input[id].text;
        this.custom_input_array1.push(id);
      }
      else if(this.selected_input_type=='ca')
      {
        this.used_token_map.set(id,1);
        this.selected_input_ref.value+=" "+this.json_input[id].text;
        this.custom_input_array2.push(id);
      }
      else if(this.selected_input_type=='co')
      {
        this.used_token_map.set(id,1);
        this.selected_input_ref.value+=" "+this.json_input[id].text;
        this.custom_input_array1.push(id);
      }
     }
    }
  }

  zoom_in()
  {
    if (this.times >= 2.5) return;

    this.times += 0.2;

    this.img_ref.nativeElement.style.height = this.l * this.times + 'px';
    this.img_ref.nativeElement.style.width = this.c * this.times + 'px';

    this.img_length = this.l * this.times;
    this.img_width = this.c * this.times;

    for (let i = 0; i < this.coordinate_array.length; i++) {
      
      // console.log(this.coordinate_array[i]);
      // console.log(this.json_input);

      this.coordinate_array[i].box[0] = (this.json_input[i].box[0]/(this.times-0.2)) * this.times;
      this.coordinate_array[i].box[1] = (this.json_input[i].box[1]/(this.times-0.2)) * this.times;
      this.coordinate_array[i].box[2] = (this.json_input[i].box[2]/(this.times-0.2)) * this.times;
      this.coordinate_array[i].box[3] = (this.json_input[i].box[3]/(this.times-0.2)) * this.times;
    
    }
  }
  zoom_out()
  {
    this.times -= 0.2;

    this.img_ref.nativeElement.style.height = this.l * this.times + 'px';
    this.img_ref.nativeElement.style.width = this.c * this.times + 'px';

    this.img_length = this.l * this.times;
    this.img_width = this.c * this.times;

   
    for (let i = 0; i < this.coordinate_array.length; i++) {
      this.coordinate_array[i].box[0] = (this.json_input[i].box[0]/(this.times+0.2)) * this.times;
      this.coordinate_array[i].box[1] = (this.json_input[i].box[1]/(this.times+0.2)) * this.times;
      this.coordinate_array[i].box[2] = (this.json_input[i].box[2]/(this.times+0.2)) * this.times;
      this.coordinate_array[i].box[3]= (this.json_input[i].box[3]/(this.times+0.2)) * this.times;
    }
  }
   
  token_mouse_enter(data:any)
  {
    data.stroke="#39a87a";
  }

  token_mouse_out(data:any)
  {
    data.stroke="";
  }
 
  next_button_click()
  {
    this.clear_custom_input();
    this.clear_selected_input_ref();

    if(this.custom_input_type=='Header')
    {
      this.custom_input_type='Q&A';
      this.custom_question_input_ref.nativeElement.style.display="block";
      this.custom_answer_input_ref.nativeElement.style.display="block";
      this.custom_header_input_ref.nativeElement.style.display="none";
      this.custom_other_input_ref.nativeElement.style.display="none";
    }
    else if(this.custom_input_type=='Q&A')
    {
      this.custom_input_type='Other';
      this.custom_header_input_ref.nativeElement.style.display="none";
      this.custom_question_input_ref.nativeElement.style.display="none";
      this.custom_answer_input_ref.nativeElement.style.display="none";
      this.custom_other_input_ref.nativeElement.style.display="block";
    }
    else
    {
       this.custom_input_type='Header';
       this.custom_header_input_ref.nativeElement.style.display="block";
       this.custom_question_input_ref.nativeElement.style.display="none";
       this.custom_answer_input_ref.nativeElement.style.display="none";
       this.custom_other_input_ref.nativeElement.style.display="none"; 
    }
  }

  select_input(ref:any,type:any,index:number)
  {
     this.selected_input_ref=ref;
     this.selected_input_type=type;
     this.selected_input_index=index; 

  }
  
  make_custom_entity()
  {
     if(this.custom_input_type=='Header')
     {
        if(this.custom_header_input_ref.nativeElement.value=="")
        {
          alert("select some tokens first to make an entity");
        }
        else
        {
          for(let i=0;i<this.custom_input_array1.length;i++)
          {
            this.used_token_map.set(this.custom_input_array1[i],1);
          }

          this.header_entity_indexs.push(this.custom_input_array1);
          this.header_entity_strings.push(this.custom_header_input_ref.nativeElement.value);
          
          this.custom_input_array1=[];
          this.custom_header_input_ref.nativeElement.value="";
        }
     }
     else if(this.custom_input_type=='Other')
     {
        if(this.custom_other_input_ref.nativeElement.value=="")
        {
          alert("select some tokens first to make an entity");
        }
        else
        {
          for(let i=0;i<this.custom_input_array1.length;i++)
          {
            this.used_token_map.set(this.custom_input_array1[i],1);
          }

          this.other_entity_indexs.push(this.custom_input_array1);
          this.other_entity_strings.push(this.custom_other_input_ref.nativeElement.value);

          this.custom_input_array1=[];
          this.custom_other_input_ref.nativeElement.value="";
        }
      }
      else
      {
        if(this.custom_question_input_ref.nativeElement.value==""
        ||this.custom_answer_input_ref.nativeElement.value=="")
        {
          alert("select some tokens first to make an entity");
        }
        else
        {
          for(let i=0;i<this.custom_input_array1.length;i++)
          {
            this.used_token_map.set(this.custom_input_array1[i],1);
          }

          for(let i=0;i<this.custom_input_array2.length;i++)
          {
            this.used_token_map.set(this.custom_input_array2[i],1);
          }
          
          this.question_entity_indexs.push(this.custom_input_array1);
          this.question_entity_strings.push(this.custom_question_input_ref.nativeElement.value);
          
          this.answer_entity_indexs.push(this.custom_input_array2);
          this.answer_entity_strings.push(this.custom_answer_input_ref.nativeElement.value);
          
          this.custom_input_array1=[];
          this.custom_input_array2=[];
          
          this.custom_question_input_ref.nativeElement.value="";
          this.custom_answer_input_ref.nativeElement.value="";
        }
      }
    }

  clear_custom_input()
  {
    if(this.custom_input_type=='Header'||this.custom_input_type=='Other')
    {
      for(let i=0;i<this.custom_input_array1.length;i++)
      {
        this.used_token_map.delete(this.custom_input_array1[i]);
      }
      
      this.custom_input_array1=[];
      
      this.custom_header_input_ref.nativeElement.value="";
      this.custom_other_input_ref.nativeElement.value="";
    }
    else
    {
      for(let i=0;i<this.custom_input_array1.length;i++)
      {
        this.used_token_map.delete(this.custom_input_array1[i]);
      }
      for(let i=0;i<this.custom_input_array2.length;i++)
      {
        this.used_token_map.delete(this.custom_input_array2[i]);
      }

      this.custom_input_array1=[];
      this.custom_input_array2=[];
      
      this.custom_question_input_ref.nativeElement.value="";
      this.custom_answer_input_ref.nativeElement.value="";
    }
  }
  clear_custom_input_cell()
  {
    if(this.selected_input_type=='ch'||this.selected_input_type=='co'||this.selected_input_type=='cq')
    {
      for(let i=0;i<this.custom_input_array1.length;i++)
      {
        this.used_token_map.delete(this.custom_input_array1[i]);
      }
      
      this.custom_input_array1=[];
      this.selected_input_ref.value="";
    }
    else
    {
      for(let i=0;i<this.custom_input_array2.length;i++)
      {
        this.used_token_map.delete(this.custom_input_array2[i]);
      }
      
      this.custom_input_array2=[];
      this.selected_input_ref.value="";
    }
  }

  clear_entity_cell()
  {
    if(this.selected_input_type=='q')
    {
      for(let i=0;i<this.question_entity_indexs[this.selected_input_index].length;i++)
      {
       this.used_token_map.delete(this.question_entity_indexs[this.selected_input_index][i]);
      }

       this.question_entity_strings[this.selected_input_index]="";
       this.question_entity_indexs[this.selected_input_index]=[];
    }
    else if(this.selected_input_type=='a')
    {
      for(let j=0;j<this.answer_entity_indexs[this.selected_input_index].length;j++)
      {
       this.used_token_map.delete(this.answer_entity_indexs[this.selected_input_index][j]);
      }

      this.answer_entity_strings[this.selected_input_index]="";
      this.answer_entity_indexs[this.selected_input_index]=[];
    }
    else if(this.selected_input_type=='h')
    {
      for(let j=0;j<this.header_entity_indexs[this.selected_input_index].length;j++)
      {
       this.used_token_map.delete(this.header_entity_indexs[this.selected_input_index][j]);
      }

      this.header_entity_strings[this.selected_input_index]="";
      this.header_entity_indexs[this.selected_input_index]=[];
    }
    else if(this.selected_input_type=='o')
    {
      for(let j=0;j<this.other_entity_indexs[this.selected_input_index].length;j++)
      {
       this.used_token_map.delete(this.other_entity_indexs[this.selected_input_index][j]);
      }

      this.other_entity_strings[this.selected_input_index]="";
      this.other_entity_indexs[this.selected_input_index]=[];
    }
  }
  clear_selected_input_ref()
  {
     this.selected_input_ref=undefined;
     this.selected_input_type="";
     this.selected_input_index=-1; 
  }

  delete_entity(type:string,index:number)
  {
     if(type=='q')
     {
       for(let i=0;i<this.question_entity_indexs[index].length;i++)
       {
        this.used_token_map.delete(this.question_entity_indexs[index][i]);
       }

       for(let j=0;j<this.answer_entity_indexs[index].length;j++)
       {
        this.used_token_map.delete(this.answer_entity_indexs[index][j]);
       }
       this.question_entity_strings.splice(index,1);
       this.question_entity_indexs.splice(index,1);

       this.answer_entity_strings.splice(index,1);
       this.answer_entity_indexs.splice(index,1);
     }
     else if(type=='h')
     {
      for(let i=0;i<this.header_entity_indexs[index].length;i++)
       {
        this.used_token_map.delete(this.header_entity_indexs[index][i]);
       }
       this.header_entity_strings.splice(index,1);
       this.header_entity_indexs.splice(index,1);
     }
     else if(type=='o')
     {
      for(let i=0;i<this.other_entity_indexs[index].length;i++)
       {
        this.used_token_map.delete(this.other_entity_indexs[index][i]);
       }
       this.other_entity_strings.splice(index,1);
       this.other_entity_indexs.splice(index,1);
     }
  }
  save_all_data()
  {
    console.log("question answer entities are \n");
    for(let i=0;i<this.question_entity_strings.length;i++)
    {
      console.log(this.question_entity_strings[i]+"' <-> '"+this.answer_entity_strings[i]+"\n");
    }
    console.log("header entities are \n");
    for(let i=0;i<this.header_entity_strings.length;i++)
    {
      console.log(this.header_entity_strings[i]+"\n");
    }
    console.log("other entities are \n");
    for(let i=0;i<this.other_entity_strings.length;i++)
    {
      console.log(this.other_entity_strings[i]+"\n");
    }
  }
}

// @ViewChild('header_input_ref') header_input_ref:any;
// @ViewChild('question_input_ref') question_input_ref:any;
// @ViewChild('answer_input_ref') answer_input_ref:any;
// @ViewChild('i_r') img_ref: any;
// @ViewChild('sv') svg_ref: any;
// @ViewChild('entity_rect_ref') entity_rect_ref:any;


// constructor(private apiData: ApiDataService) { }

// apiPageData:any=[];
// coordinate_array:any;
// cord1:any;

// title:string="";
// selected_input_name:string="";
// entity_type_button:string="Header";
// // coordinate_array:any=cord1.form;  


// img_length: number=0;
// img_width: number=0;

// l: number = 0;
// c: number = 0;

// times:number=1;

// temp_array_1:number[]=[];
// temp_array_2:number[]=[];

// question_input_index:number[][]=[];
// question_array:string[]=[];

// answer_input_index:number[][]=[];
// answer_array:string[]=[];

// header_input_index:number[][]=[];
// header_array:string[]=[];

// ngOnInit(): void {
  
//   /********************api calls initializing arrays*****************/

//   this.apiData.docData = localStorage.getItem('global_doc_id')

//   this.apiData.get_pages(this.apiData.docData).subscribe((data)=>{
        
//     this.apiPageData = data;

//     this.cord1 = data[0].kvpData;

//     this.coordinate_array = data[0].kvpData.form;
       
// });
// /*******************************************************************/

 
// }

// ngAfterViewInit(): void{

//   setTimeout(()=>{
//     this.img_length=this.img_ref.nativeElement.offsetHeight;
//     this.img_width=this.img_ref.nativeElement.offsetWidth;
//     this.l=this.img_ref.nativeElement.offsetHeight;
//     this.c=this.img_ref.nativeElement.offsetWidth;
    
    // console.log(this.cord1.form)
    /**************************************************************************** */ 
    /********************Code edited (needs correction)************************** */
    /*****************pre-populating arrays with api data*************************/
    /*************************************************************************** */
    // for (let i = 0; i < this.coordinate_array.length; i++){
    //   if( this.coordinate_array[i].label.toLowerCase( ) === 'header'){
    //        this.header_array.push(this.coordinate_array[i].text)
    //        this.header_input_index.push([i])
    //   }
    //   else if( this.coordinate_array[i].label.toLowerCase( ) === 'question'){
    //        this.question_array.push(this.coordinate_array[i].text)
    //        this.question_input_index.push([i])
    //   }
    //   else if( this.coordinate_array[i].label.toLowerCase( ) === 'answer'){
    //        this.answer_array.push(this.coordinate_array[i].text)
    //        this.answer_input_index.push([i])
    //   }
    //   else{
         
    //       // this.others_array.push(this.coordinate_array[i].text)
         
    //   }

    // }
 
    // console.log("h"+this.header_array)

    /************************************************************************/
    /***********************************************************************/

//   },1000);
// }

// token_mouse_enter(data:any)
// {
//   data.stroke="#39a87a";
// }

// token_mouse_out(data:any)
// {
//   data.stroke="";
// }

// token_click(data:any)
// {
//   if(this.selected_input_name=='header') 
//   {
//     if(this.header_input_ref.nativeElement.value!="")
//     {
//       this.temp_array_1.push(data);
//       this.header_input_ref.nativeElement.value+= " " + this.coordinate_array[data].text;
//     }
//     else
//     {
//       this.temp_array_1=[];
//       this.temp_array_1.push(data);
//       this.header_input_ref.nativeElement.value+=this.coordinate_array[data].text;
//     }
//   }
//   else if(this.selected_input_name=='question')
//   {
//     if(this.question_input_ref.nativeElement.value!="")
//     {
//       this.temp_array_1.push(data);
//       this.question_input_ref.nativeElement.value+= " " + this.coordinate_array[data].text;
//     }
//     else
//     {
//       this.temp_array_1=[];
//       this.temp_array_1.push(data);
//       this.question_input_ref.nativeElement.value+=this.coordinate_array[data].text;
//     }
//   }
//   else if(this.selected_input_name=='answer')
//   {
//     if(this.answer_input_ref.nativeElement.value!="")
//     {
//       this.temp_array_2.push(data);
//       this.answer_input_ref.nativeElement.value+= " " + this.coordinate_array[data].text;
//     }
//     else
//     {
//       this.temp_array_2=[];
//       this.temp_array_2.push(data);
//       this.answer_input_ref.nativeElement.value+=this.coordinate_array[data].text;
//     }
//   }
// }

// next_button_click()
// {
//   this.selected_input_name="";// stop adding token on selecting new entity type

//   if(this.entity_type_button=='Header')
//   {
//     this.entity_type_button='Q&A';
//     this.question_input_ref.nativeElement.style.display="block";
//     this.answer_input_ref.nativeElement.style.display="block";
//     this.header_input_ref.nativeElement.style.display="none";
//   }
//   else
//   {
//     this.entity_type_button='Header';
//     this.header_input_ref.nativeElement.style.display="block";
//     this.question_input_ref.nativeElement.style.display="none";
//     this.answer_input_ref.nativeElement.style.display="none";
//   }
// }

// select_input(input_type:any)
// {
//   this.entity_rect_ref.nativeElement.style.height=0;
//   this.entity_rect_ref.nativeElement.style.width=0;
  
//   this.selected_input_name=input_type; 
// }

// submit_entity()
// {
//   if(this.entity_type_button=='Header')
//   {
//     if(this.header_input_ref.nativeElement.value=="")
//     {
//       alert("make a header entity first to submit");
//     }
//     else
//     {
//       console.log(this.header_input_index);
//       this.header_array.push(this.header_input_ref.nativeElement.value);
//       this.header_input_index.push(this.temp_array_1);

//       this.temp_array_1=[];
//       this.header_input_ref.nativeElement.value="";
//     }
//   }
//   else
//   {
//     if(this.question_input_ref.nativeElement.value==""||this.answer_input_ref.nativeElement.value=="")
//     {
//       alert("make a question and answer entity first to submit");
//     }
//     else
//     {
//       // console.log(this.question_input_index);
//       // console.log(this.answer_input_index);
//       this.question_array.push(this.question_input_ref.nativeElement.value);
//       this.question_input_index.push(this.temp_array_1);
//       this.temp_array_1=[];
//       this.question_input_ref.nativeElement.value="";

//       this.answer_array.push(this.answer_input_ref.nativeElement.value);
//       this.answer_input_index.push(this.temp_array_2);
//       this.temp_array_2=[];
//       this.answer_input_ref.nativeElement.value="";
//     }
//   }
// }
// delete_entity(ind:number,t:string)
// {
//   this.entity_rect_ref.nativeElement.style.height=0;
//   this.entity_rect_ref.nativeElement.style.width=0;

//    if(t=='H')
//    {
//     this.header_array.splice(ind,1);
//     this.header_input_index.splice(ind,1);
//    }
//    else
//    {
//     this.question_array.splice(ind,1);
//     this.answer_array.splice(ind,1);
//     this.question_input_index.splice(ind,1);
//     this.answer_input_index.splice(ind,1);
//    }
// }
// clear_input(type:any)
// {
//    if(type=='h')
//    this.header_input_ref.nativeElement.value="";
//    else if(type=='q')
//    this.question_input_ref.nativeElement.value="";
//    else
//    this.answer_input_ref.nativeElement.value="";
// }

// zoom_in() {
//   if (this.times >= 2.5) return;

//   this.times += 0.2;

//   this.img_ref.nativeElement.style.height = this.l * this.times + 'px';
//   this.img_ref.nativeElement.style.width = this.c * this.times + 'px';

//   this.img_length = this.l * this.times;
//   this.img_width = this.c * this.times;

//   for (let i = 0; i < this.coordinate_array.length; i++) {
//     this.coordinate_array[i].box[0] = (this.cord1.form[i].box[0]/(this.times-0.2)) * this.times;
//     this.coordinate_array[i].box[1] = (this.cord1.form[i].box[1]/(this.times-0.2)) * this.times;
//     this.coordinate_array[i].box[2] = (this.cord1.form[i].box[2]/(this.times-0.2)) * this.times;
//     this.coordinate_array[i].box[3]= (this.cord1.form[i].box[3]/(this.times-0.2)) * this.times;
//   }
// }

// zoom_out() {

//   this.times -= 0.2;

//   this.img_ref.nativeElement.style.height = this.l * this.times + 'px';
//   this.img_ref.nativeElement.style.width = this.c * this.times + 'px';

//   this.img_length = this.l * this.times;
//   this.img_width = this.c * this.times;

 
//   for (let i = 0; i < this.coordinate_array.length; i++) {
//     this.coordinate_array[i].box[0] = (this.cord1.form[i].box[0]/(this.times+0.2)) * this.times;
//     this.coordinate_array[i].box[1] = (this.cord1.form[i].box[1]/(this.times+0.2)) * this.times;
//     this.coordinate_array[i].box[2] = (this.cord1.form[i].box[2]/(this.times+0.2)) * this.times;
//     this.coordinate_array[i].box[3]= (this.cord1.form[i].box[3]/(this.times+0.2)) * this.times;
//   }
// }

// entity_click(type:string,index:number)
// {
//   var x=999,y=999,x2=-1,y2=-1;
//    if(type=='q')
//    { 
//    for(let i=0;i<this.question_input_index[index].length;i++)
//    {
//     if(x>this.coordinate_array[this.question_input_index[index][i]].box[0]) 
//      x=this.coordinate_array[this.question_input_index[index][i]].box[0]; 
    
//     if(y>this.coordinate_array[this.question_input_index[index][i]].box[1]) 
//      y=this.coordinate_array[this.question_input_index[index][0]].box[1];

//     if(x2<this.coordinate_array[this.question_input_index[index][i]].box[2])  
//     x2=this.coordinate_array[this.question_input_index[index][i]].box[2]

//     if(y2<this.coordinate_array[this.question_input_index[index][i]].box[3])  
//     y2=this.coordinate_array[this.question_input_index[index][i]].box[3]
//    }
//    }
//    else if(type=='a')
//    {  
//     for(let i=0;i<this.answer_input_index[index].length;i++)
//     {
//      if(x>this.coordinate_array[this.answer_input_index[index][i]].box[0]) 
//       x=this.coordinate_array[this.answer_input_index[index][i]].box[0]; 
     
//      if(y>this.coordinate_array[this.answer_input_index[index][i]].box[1]) 
//       y=this.coordinate_array[this.answer_input_index[index][0]].box[1];

//      if(x2<this.coordinate_array[this.answer_input_index[index][i]].box[2])  
//      x2=this.coordinate_array[this.answer_input_index[index][i]].box[2]

//      if(y2<this.coordinate_array[this.answer_input_index[index][i]].box[3])  
//      y2=this.coordinate_array[this.answer_input_index[index][i]].box[3]
//     }
//    }
//    else
//    { 
//     for(let i=0;i<this.header_input_index[index].length;i++)
//     {
//      if(x>this.coordinate_array[this.header_input_index[index][i]].box[0]) 
//       x=this.coordinate_array[this.header_input_index[index][i]].box[0]; 
     
//      if(y>this.coordinate_array[this.header_input_index[index][i]].box[1]) 
//       y=this.coordinate_array[this.header_input_index[index][0]].box[1];

//      if(x2<this.coordinate_array[this.header_input_index[index][i]].box[2])  
//      x2=this.coordinate_array[this.header_input_index[index][i]].box[2]

//      if(y2<this.coordinate_array[this.header_input_index[index][i]].box[3])  
//      y2=this.coordinate_array[this.header_input_index[index][i]].box[3]
//     } 
//    }

//    this.entity_rect_ref.nativeElement.style.x=x;
//    this.entity_rect_ref.nativeElement.style.y=y;
   
//    this.entity_rect_ref.nativeElement.style.height=y2-y;
//    this.entity_rect_ref.nativeElement.style.width=x2-x;
// }