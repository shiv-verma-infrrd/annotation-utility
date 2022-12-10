import { AfterViewInit, Component,ViewChild} from '@angular/core';
// import cord1 from 'src/assets/page1.json'; /*****comented initializing array in constructor*******/
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
  @ViewChild('other_input_ref') other_input_ref:any;
  @ViewChild('i_r') img_ref: any;
  @ViewChild('sv') svg_ref: any;
  @ViewChild('entity_rect_ref') entity_rect_ref:any;

  apiPageData:any;
  cord1:any;
  coordinate_array:any;
 

  title:string="";
  selected_input_name:string="";
  entity_type_button:string="Header";

  img_length: number=0;
  img_width: number=0;

  l: number = 0;
  c: number = 0;

  times:number=1;

  token_map=new Map(); 
  map1=new Map();
  map2=new Map();


  question_input_index:number[][]=[];
  question_array:string[]=[];
  
  answer_input_index:number[][]=[];
  answer_array:string[]=[];
  
  header_input_index:number[][]=[];
  header_array:string[]=[];

  other_input_index:number[][]=[];
  other_array:string[]=[];

  constructor(private apiData: ApiDataService)
  {
      this.apiData.docData = localStorage.getItem('global_doc_id')
    
      this.apiData.get_pages(this.apiData.docData).subscribe((data)=>{
            
        this.apiPageData = data;
    
        this.cord1 = data[0].kvpData;
    
        this.coordinate_array = data[0].kvpData.form;
        console.log(data);   
    });
  }

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
    if(this,this.token_map.has(data))
    {
      alert("this token is already used");
      return;
    }

    if(this.selected_input_name=='header') 
    {
      if(this.header_input_ref.nativeElement.value=="")
      this.map1.clear();

      this.map1.set(data,1);
      if(this.header_input_ref.nativeElement.value!="")
       this.header_input_ref.nativeElement.value+= " " + this.coordinate_array[data].text;
      else
        this.header_input_ref.nativeElement.value+=this.coordinate_array[data].text;
    }
    else if(this.selected_input_name=='other')
    {
      if(this.other_input_ref.nativeElement.value=="")
      this.map1.clear();

      this.map1.set(data,1);
      if(this.other_input_ref.nativeElement.value!="")
       this.other_input_ref.nativeElement.value+= " " + this.coordinate_array[data].text;
      else
        this.other_input_ref.nativeElement.value+=this.coordinate_array[data].text;
    }
    else if(this.selected_input_name=='question')
    {
      if(this.question_input_ref.nativeElement.value=="")
      this.map1.clear();

      this.map1.set(data,1);
      if(this.question_input_ref.nativeElement.value!="")
        this.question_input_ref.nativeElement.value+= " " + this.coordinate_array[data].text;
      else
        this.question_input_ref.nativeElement.value+=this.coordinate_array[data].text;
    }
    else if(this.selected_input_name=='answer')
    {
      if(this.answer_input_ref.nativeElement.value=="")
      this.map2.clear();

      this.map2.set(data,1);
      if(this.answer_input_ref.nativeElement.value!="")
        this.answer_input_ref.nativeElement.value+= " " + this.coordinate_array[data].text;
      else
        this.answer_input_ref.nativeElement.value+=this.coordinate_array[data].text;
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
      this.other_input_ref.nativeElement.style.display="none";
    }
    else if(this.entity_type_button=='Q&A')
    {
      this.entity_type_button='Other';
      this.header_input_ref.nativeElement.style.display="none";
      this.question_input_ref.nativeElement.style.display="none";
      this.answer_input_ref.nativeElement.style.display="none";
      this.other_input_ref.nativeElement.style.display="block";
    }
    else
    {
       this.entity_type_button='Header';
       this.header_input_ref.nativeElement.style.display="block";
       this.question_input_ref.nativeElement.style.display="none";
       this.answer_input_ref.nativeElement.style.display="none";
       this.other_input_ref.nativeElement.style.display="none"; 
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
        let t:number[]=[];
        let tv:string="";
        
        for(let key of this.map1.keys())
        {
          t.push(key);
          this.token_map.set(key,1);
          tv+=this.coordinate_array[key].text+" ";
        }

        this.header_array.push(tv);
        this.header_input_index.push(t);

        this.header_input_ref.nativeElement.value="";
        this.map1.clear();
      }
    }
    else if(this.entity_type_button=='Q&A')
    {
      if(this.question_input_ref.nativeElement.value==""||this.answer_input_ref.nativeElement.value=="")
      {
        alert("make a question and answer entity first to submit");
      }
      else
      {
        let t:number[]=[];
        let tv:string="";
        
        for(let key of this.map1.keys())
        {
          t.push(key);
          this.token_map.set(key,1);
          tv+=this.coordinate_array[key].text+" ";
        }

        this.question_array.push(tv);
        this.question_input_index.push(t);
        this.question_input_ref.nativeElement.value="";
        this.map1.clear();
       
        let t2:number[]=[];
        let tv2:string="";
        
        for(let key of this.map2.keys())
        {
          t2.push(key);
          this.token_map.set(key,1);
          tv2+=this.coordinate_array[key].text+" ";
        }
         
        this.answer_array.push(tv2);
        this.answer_input_index.push(t2);
        this.answer_input_ref.nativeElement.value="";

        this.map2.clear();
      }
    }
    else
    {
      if(this.other_input_ref.nativeElement.value=="")
      {
        alert("make an other entity first to submit");
      }
      else
      {
        let t:number[]=[];
        let tv:string="";
        
        for(let key of this.map1.keys())
        {
          t.push(key);
          this.token_map.set(key,1);
          tv+=this.coordinate_array[key].text+" ";
        }

        this.other_array.push(tv);
        this.other_input_index.push(t);

        this.other_input_ref.nativeElement.value="";
        this.map1.clear();
      }
    }
  }
  delete_entity(ind:number,t:string)
  {
    this.entity_rect_ref.nativeElement.style.height=0;
    this.entity_rect_ref.nativeElement.style.width=0;

     if(t=='h')
     {
      for(let i=0;i<this.header_input_index[ind].length;i++)
      {
        this.token_map.delete(this.header_input_index[ind][i]);
      }

      this.header_array.splice(ind,1);
      this.header_input_index.splice(ind,1);
     }
     else if(t=='q')
     {
      for(let i=0;i<this.question_input_index[ind].length;i++)
      {
        this.token_map.delete(this.question_input_index[ind][i]);
      }
      this.question_array.splice(ind,1);
      this.answer_array.splice(ind,1);
      
      for(let i=0;i<this.answer_input_index[ind].length;i++)
      {
        this.token_map.delete(this.answer_input_index[ind][i]);
      }
      this.question_input_index.splice(ind,1);
      this.answer_input_index.splice(ind,1);
     }
     else
     {
      for(let i=0;i<this.other_input_index[ind].length;i++)
      {
        this.token_map.delete(this.other_input_index[ind][i]);
      }

      this.other_array.splice(ind,1);
      this.other_input_index.splice(ind,1);
     }
  }
  clear_input(type:any)
  {
     if(type=='h')
     this.header_input_ref.nativeElement.value="";
     else if(type=='q')
     this.question_input_ref.nativeElement.value="";
     else if(type=='a')
     this.answer_input_ref.nativeElement.value="";
     else
     this.other_input_ref.nativeElement.value="";
  }
  
  zoom_in() {
    if (this.times >= 2.5) return;

    this.times += 0.2;

    this.img_ref.nativeElement.style.height = this.l * this.times + 'px';
    this.img_ref.nativeElement.style.width = this.c * this.times + 'px';

    this.img_length = this.l * this.times;
    this.img_width = this.c * this.times;

    for (let i = 0; i < this.coordinate_array.length; i++) {
      this.coordinate_array[i].box[0] = (this.cord1.form[i].box[0]/(this.times-0.2)) * this.times;
      this.coordinate_array[i].box[1] = (this.cord1.form[i].box[1]/(this.times-0.2)) * this.times;
      this.coordinate_array[i].box[2] = (this.cord1.form[i].box[2]/(this.times-0.2)) * this.times;
      this.coordinate_array[i].box[3]= (this.cord1.form[i].box[3]/(this.times-0.2)) * this.times;
    }
  }

  zoom_out() {

    this.times -= 0.2;

    this.img_ref.nativeElement.style.height = this.l * this.times + 'px';
    this.img_ref.nativeElement.style.width = this.c * this.times + 'px';

    this.img_length = this.l * this.times;
    this.img_width = this.c * this.times;

   
    for (let i = 0; i < this.coordinate_array.length; i++) {
      this.coordinate_array[i].box[0] = (this.cord1.form[i].box[0]/(this.times+0.2)) * this.times;
      this.coordinate_array[i].box[1] = (this.cord1.form[i].box[1]/(this.times+0.2)) * this.times;
      this.coordinate_array[i].box[2] = (this.cord1.form[i].box[2]/(this.times+0.2)) * this.times;
      this.coordinate_array[i].box[3]= (this.cord1.form[i].box[3]/(this.times+0.2)) * this.times;
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