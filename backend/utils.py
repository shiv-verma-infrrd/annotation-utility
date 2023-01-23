from datetime import datetime
import json
import os
import shutil
from PIL import Image
from flask import request
import zipfile
import uuid
from io import BytesIO,StringIO
from flask import Flask, Response, jsonify, make_response, request, send_file
from zipfile import ZIP_DEFLATED, ZipFile


def get_user(user_id, users):
    for user in users.find():
        if user_id == str(user['_id']):
            return user
    return None


def generate_batch_id(db):
    Db_data = list(db.batches.find({}, {'batchId': 1, '_id': 0}))
    print(Db_data)

    batch_id = 0
    for x in Db_data:
        if x['batchId'] > batch_id:
            batch_id = x['batchId']

    return batch_id + 1


# def get_batch_type(path):
#     dir_list = os.listdir(path)
#     if len(dir_list) == 2:
#         return 'form'
#     elif len(dir_list) == 3:
#         return 'checkbox'


# def image_to_jpg(batch_id, zip_file_name):
#     directory = f'../assets/{batch_id}/{batch_id}/images'

#     for filename in os.listdir(directory):
#         if not filename.endswith('jpg'):
#             exten = filename.rsplit('.', 1)[-1]
#             im = Image.open(os.path.join(directory, filename))
#             name = os.path.join(directory, filename.replace(exten, 'jpg'))
#             rgb_im = im.convert('RGB')
#             rgb_im.save(name)
#             os.remove(os.path.join(directory, filename))


# def rename_file(batch_id):
#     directory = f"../assets/{batch_id}"
#     for file1 in os.listdir(directory):
#         os.rename(os.path.join(directory, file1),
#                   os.path.join(directory, str(batch_id)))


# def get_last_file():
#     di = f"../assets"
#     last_file_id = 0
#     for file1 in os.listdir(di):
#         if int(file1) > last_file_id:
#             last_file_id = int(file1)
#     return last_file_id


def remove_filesystem_folder(batch_id,up_dir):
    dirs = [
        os.path.join(up_dir,f"{batch_id}/checkboxes"),
        os.path.join(up_dir,f"{batch_id}/annotations"),
        os.path.join(up_dir,f"{batch_id}/ocrs")
    ]

    for path in dirs:
        if os.path.exists(path):
            shutil.rmtree(path)

def get_checkbox_data(path, file_name):
    file_name = file_name.split('.')[0]+'_checkboxes.json'
    # print(file_name)
    path = '/'.join(path.split('/')[:-1]+['checkboxes'])
    
    f = os.path.join(path, file_name)
    if os.path.isfile(f):
        with open(f) as file_1:
            file_data = json.load(file_1)
    return file_data

def get_data(batch_path, filename, filetype):
    if filetype == 'kvp':
        filename = filename.split('.')[0]+'.json'
        path = batch_path+"/annotations/"
    elif filetype == 'ocr':
        filename = filename.split('.')[0]+'.json'
        print('!!!: ', filename)
        path = batch_path+"/ocrs/"
    elif filetype == 'checkbox':
        filename = filename.split('.')[0]+'_checkboxes.json'
        path = batch_path+"/checkboxes/"

    f = os.path.join(path, filename)
    if os.path.isfile(f):
        with open(f) as file_1:
            file_data = json.load(file_1)
        # print('daa: ', file_data)
        return file_data
    else:
        return {}

def generate_data(batch_id, batch_path, filename):
    data = {
            "imgid": str(uuid.uuid4()),
            "batchId": str(batch_id),
            "documentId": str(uuid.uuid4()),
            "batchName": request.form['batch_name'],
            "document_name": str(os.path.splitext(filename)[0]),
            "isCorrected": "False",
            "imageStatus": "Not Corrected",
            "imagePath": f"/{batch_id}/{os.path.splitext(filename)[0]}",
            "type": json.loads( request.form['document_type']),
            "correctedData": {
                "checkboxData": {},
                "ocrData": {},
                "kvpData": {},
            },
            "correctedBy": "",
            "correctedOn": ""
        }

    if 'fields' in json.loads( request.form['document_type']) and 'checkboxes' in json.loads( request.form['document_type']):
        image_data = {
                        "checkboxData": get_data(batch_path, filename, 'checkbox'),
                        "ocrData": get_data(batch_path, filename, 'ocr'),
                        "kvpData": get_data(batch_path, filename, 'kvp'),
                    }
    elif 'fields' in json.loads(request.form['document_type']):
    # if type == 'fields':
        image_data = {
                        "checkboxData": {},
                        "ocrData": {},
                        "kvpData": get_data(batch_path, filename, 'kvp'),
                    }
    elif 'checkboxes' in json.loads( request.form['document_type']):
    # elif type == 'checkboxes':
        image_data = {
                        "checkboxData": get_data(batch_path, filename, 'checkbox'),
                        # "checkboxData": {},
                        "ocrData": get_data(batch_path, filename, 'ocr'),
                        "kvpData": {},
                    }
    # print('\n^^^^^^^^^^^^',image_data)
    data['Data'] = image_data
    return data
    
    

def files(path):
    for file in os.listdir(path):
        if os.path.isfile(os.path.join(path, file)):
            yield file

def push_json_data_in_db(batch_id, db, up_dir):
    print('pushing data')
    doc_cnt = 0
    batch_path = os.path.join(up_dir,f"{batch_id}")
    # print(batch_path)

    for filename in os.listdir(batch_path):
        # print(filename)
        f = os.path.join(batch_path, filename)
        if os.path.isfile(f):
            doc_data = generate_data(batch_id, batch_path, filename)
            doc_cnt += 1
            db.pages.insert_one(doc_data)

    batch_data = {
        "batchId": str(batch_id),
        "batchName": request.form['batch_name'],
        "documentCount": doc_cnt,
        "isCorrected": "False",
        "allocatedBy": "admin",
        "allocatedToUsers": [],
        "allocatedToTeams":[],
        "allocatedOn": "8/12/2022",
        "createdOn": "8/12/2022",
        "createdBy": "admin"
    }
    batch_data['type'] = json.loads(request.form['document_type'])
    db.batches.insert_one(batch_data)

def transform_data(file_data,checkbox_data):
        
        # print(checkbox_data['questions'])
        # print(file_data[103])
        # print(file_data[38])
        form = []
        e_check = {}
        # print("###########",len(e_check)
        empty_question_id = -1
        empty_question_ids = []
        
        for l in range(len(checkbox_data['questions'])):
               question = checkbox_data['questions'][l]['token_indexes']
               if len(question) == 0:
                   d = {
                        "box" : [],
                        "text" : "",
                        "label" : "checkbox_question",
                        "words" : [{ 
                            "box" : [],
                            "text" : ""
                                    }],
                        "linking":[],
                        "id" : empty_question_id
                       }
                   empty_question_ids.append(empty_question_id)
                   empty_question_id = empty_question_id - 1 
                   form.append(d)
        # print(empty_question_id)
        # print(empty_question_ids)
        empty_question_ids_len = len(empty_question_ids)
        for i in range(len(file_data)): 
            
            data = {
                        "box" : [file_data[i][1]['tl']['x'],file_data[i][1]['tl']['y'],file_data[i][1]['br']['x'],file_data[i][1]['br']['y']],
                        "text" : file_data[i][0],
                        "label" : "",
                        "words" : [{ 
                            "box" : [file_data[i][1]['tl']['x'],file_data[i][1]['tl']['y'],file_data[i][1]['br']['x'],file_data[i][1]['br']['y']],
                            "text" : file_data[i][0]
                                    }],
                        "linking":[],
                        "id" : i
                  }
            
            for l in range(len(checkbox_data['questions'])):
               question = checkbox_data['questions'][l]['token_indexes']     
               if i in question:
                    data["label"] = 'checkbox_question'      
                    # print(data)
            
            form.append(data) 
           
                 
            for j in range(len(checkbox_data['checkboxes'])):
                
                
                
                # print(checkbox_data['checkboxes'][j]['label'])
                if i == checkbox_data['checkboxes'][j]['token_indexes'][-1]:
                    # print("before i**** ",i)
                     
                    _id = checkbox_data['checkboxes'][j]['token_indexes'][-1] - (len(checkbox_data['checkboxes'][j]['token_indexes']) - 1) 
                    
                    checkbox = {
                        "box" : [checkbox_data['checkboxes'][j]['tl']['x'],checkbox_data['checkboxes'][j]['tl']['y'],checkbox_data['checkboxes'][j]['br']['x'],checkbox_data['checkboxes'][j]['br']['y']],
                        "text" : "checkbox",
                        "label" : "checkbox",
                        "check":checkbox_data['checkboxes'][j]['label'],
                        "words" : [{ 
                            "box" : [checkbox_data['checkboxes'][j]['tl']['x'],checkbox_data['checkboxes'][j]['tl']['y'],checkbox_data['checkboxes'][j]['br']['x'],checkbox_data['checkboxes'][j]['br']['y']],
                            "text" : "checkbox"
                                    }],
                        "linking":[_id+1,_id],
                        "id" : _id + 1,
                        "question_id":"null"
                        }
                    
                    
                    entity = {
                        "box":[file_data[checkbox_data['checkboxes'][j]['token_indexes'][0]][1]['tl']['x'],
                               file_data[checkbox_data['checkboxes'][j]['token_indexes'][0]][1]['tl']['y'],
                               file_data[checkbox_data['checkboxes'][j]['token_indexes'][-1]][1]['br']['x'],
                               file_data[checkbox_data['checkboxes'][j]['token_indexes'][-1]][1]['br']['y']],
                        "label":"checkbox_string",
                        "linking":[_id,_id+1],
                        "id" : _id,
                        "question_id":"null"
                           }
                    # print(entity)
                    text = ""
                    words = []
                    for k in range(len(checkbox_data['checkboxes'][j]['token_indexes'])):
                        text = text + " " +file_data[checkbox_data['checkboxes'][j]['token_indexes'][k]][0]
                        words.append({
                            "box":[
                               file_data[checkbox_data['checkboxes'][j]['token_indexes'][k]][1]['tl']['x'],
                               file_data[checkbox_data['checkboxes'][j]['token_indexes'][k]][1]['tl']['y'],
                               file_data[checkbox_data['checkboxes'][j]['token_indexes'][k]][1]['br']['x'],
                               file_data[checkbox_data['checkboxes'][j]['token_indexes'][k]][1]['br']['y']
                               ],
                            "text": file_data[checkbox_data['checkboxes'][j]['token_indexes'][k]][0]
                            
                        })
                        for f in form[:]:
                            if f['text'] == file_data[checkbox_data['checkboxes'][j]['token_indexes'][k]][0]:
                                 form.remove(f)
                        
                  
                    entity['text'] = text
                    entity['words'] = words
                    
                    # print(checkbox_data['checkboxes'][j]['question_id'])
                  
                    for t in range(len(checkbox_data['questions'])):
                        if checkbox_data['checkboxes'][j]['question_id'] == checkbox_data['questions'][t]['id'] and len(checkbox_data['questions'][t]['token_indexes']) != 0 :
                            #   print(checkbox_data['questions'][t]['token_indexes'])
                            checkbox['question_id'] = checkbox_data['questions'][t]['token_indexes'][0]
                            entity['question_id'] = checkbox_data['questions'][t]['token_indexes'][0]
                            checkbox['question_ids'] = checkbox_data['questions'][t]['token_indexes']
                            entity['question_ids'] = checkbox_data['questions'][t]['token_indexes']
                            
                            e = {
                                        "box":[file_data[checkbox_data['questions'][t]['token_indexes'][0]][1]['tl']['x'],
                                            file_data[checkbox_data['questions'][t]['token_indexes'][0]][1]['tl']['y'],
                                            file_data[checkbox_data['questions'][t]['token_indexes'][-1]][1]['br']['x'],
                                            file_data[checkbox_data['questions'][t]['token_indexes'][-1]][1]['br']['y']],
                                        "label":"checkbox_question",
                                        "linking":[],
                                        "id" : checkbox_data['questions'][t]['token_indexes'][0],
                                        "question_id":"null"
                                }
                            
                            #   if e_check not in form:
                                    # print("### yes")
                            text = ""
                            words = []
                            for u in range(len(checkbox_data['questions'][t]['token_indexes'])):
                                        #   rem.add(file_data[checkbox_data['questions'][t]['token_indexes'][u]][0])
                                        #   print(file_data[checkbox_data['questions'][t]['token_indexes'][u]][0])
                                        text = text + " " +file_data[checkbox_data['questions'][t]['token_indexes'][u]][0]
                                        words.append({
                                            "box":[
                                            file_data[checkbox_data['questions'][t]['token_indexes'][u]][1]['tl']['x'],
                                            file_data[checkbox_data['questions'][t]['token_indexes'][u]][1]['tl']['y'],
                                            file_data[checkbox_data['questions'][t]['token_indexes'][u]][1]['br']['x'],
                                            file_data[checkbox_data['questions'][t]['token_indexes'][u]][1]['br']['y']
                                            ],
                                            "text": file_data[checkbox_data['questions'][t]['token_indexes'][u]][0]
                                            
                                        })
                                        for f in form[:]:
                                            if f['text'] == file_data[checkbox_data['questions'][t]['token_indexes'][u]][0]:
                                                form.remove(f)
                                        
                                        
                                        
                            e['text'] = text
                            e['words'] = words
                            if e not in form:
                                form.append(e)
                                e_check = e
                     
                        if checkbox_data['checkboxes'][j]['question_id'] == checkbox_data['questions'][t]['id'] and len(checkbox_data['questions'][t]['token_indexes']) == 0 :
                            checkbox['question_id'] = empty_question_ids[-1]
                            entity['question_id'] = empty_question_ids[-1]
                            empty_question_ids.pop()
                            print("checkbox string ##################")
                            print(entity)
                            print("checkboxs ##################")
                            print(checkbox)
                            print("@@@@@@@@@@@@@@@@@@")
                                          
                    form.append(entity) 
                    form.append(checkbox)
                    
                        
        
        return form        
    
def retransform_data(data):
    
    
    result = []
    for i in range(len(data['form'])):
            # print(data['form'][i])
            
            d = []
            c = {
                    "tl": {
                            "x": data['form'][i]['box'][0],
                            "y": data['form'][i]['box'][1]
                         },
                    "br": {
                            "x": data['form'][i]['box'][2],
                            "y": data['form'][i]['box'][3]
                        }
                     }
                   
            d.append(data['form'][i]['text'])         
            d.append(c)       
            d.append(data['form'][i]['id'])
           
            result.append(d)
    
    # print(result)
    
    # form = { "form" : result}      
    return result 

def transform_data_for_corrected_data(data,checkbox_data):
    
    # print(checkbox_data['questions'][0]['token_indexes'])
    result = []
    print(data[168])
    # print(data[0]['tl']['x'])
    # print(data[0]['text'])
    # print(data[0]['br']['x'])
    # print(data[0]['id'])
    
    for i in range(len(data)):
       
        d = {
                            "box" : [data[i]['tl']['x'],data[i]['tl']['y'],data[i]['br']['x'],data[i]['br']['y']],
                            "text" : data[i]['text'],
                            "label":"",
                            "words" : [{ 
                                "box" : [data[i]['tl']['x'],data[i]['tl']['y'],data[i]['br']['x'],data[i]['br']['y']],
                                "text" : data[i]['text']
                                        }],
                            "linking":[],
                            "id" : data[i]['id']
                }
        for l in range(len(checkbox_data['questions'])):
               question = checkbox_data['questions'][l]['token_indexes']
            #    print(question)
               if i in question:
                    d["label"] = 'checkbox_question'  
        # print(d['id']) 
        
        result.append(d)
        
        # for j in range(len(checkbox_data['checkboxes'])):
            
    print(result[168])    
    # form = {'form':result}
        
    return result



# def extract_file(file_data, zp, batch_id, type,path):
    
#     upload_path_forms = os.path.join(path,{batch_id})

#     validEXt = ['JPG', 'PNG', 'JSON']

#     for files in file_data:
#         print(files)
#         ext = files.rsplit(".", 1)[-1]
#         print(ext)
#         if ext.upper() in validEXt:
#             if type == 'form':
#                 zp.extract(files, upload_path)
#             elif type == 'checkbox':
#                 zp.extract(files, f'../assets/{batch_id}/{batch_id}')
#             # print(files)

        
def extract_file(my_zip,db,batch_id,up_dir):
    # up_dir = "../assets"
    my_dir = os.path.join(up_dir,str(batch_id))
    checkbox_dir = os.path.join(my_dir,"checkboxes")
    annotations_dir = os.path.join(my_dir,"annotations")
    ocrs_dir = os.path.join(my_dir,"ocrs")
    image_dir = my_dir
    
    if not os.path.exists(my_dir):
        os.mkdir(my_dir)
    
    
    
    with zipfile.ZipFile(my_zip) as zip_file:
        
        for member in zip_file.namelist():
            # print(zip_file.namelist())
            # print("****kkkkk",uuid.uuid4())
            filename = os.path.basename(member)
            if filename.endswith('_checkboxes.json'):
            #    print(filename)
               
               if not os.path.exists(checkbox_dir):
                    os.mkdir(checkbox_dir)
              
                      
               source = zip_file.open(member)
               target = open(os.path.join(checkbox_dir, filename), "wb")
               with source, target:
                 shutil.copyfileobj(source, target)
                 
            if filename.endswith('.json') and not filename.endswith('_checkboxes.json'):
                 
                if 'annotations' in member: 
                    # print(filename)
                    
                    if not os.path.exists(annotations_dir):
                        os.mkdir(annotations_dir)
                        
                    source = zip_file.open(member)
                    target = open(os.path.join(annotations_dir, filename), "wb")
                    with source, target:
                        shutil.copyfileobj(source, target)
                elif 'ocrs' in member:
                    # if not os.path.exists(ocrs_dir):
                    #     os.mkdir(ocrs_dir)
                    if not os.path.exists(ocrs_dir):
                        os.mkdir(ocrs_dir)
                        
                    source = zip_file.open(member)
                    # target = open(os.path.join(ocrs_dir, filename), "wb")
                    target = open(os.path.join(ocrs_dir, filename), "wb")
                    with source, target:
                        shutil.copyfileobj(source, target)
            if filename.endswith('.jpg') or filename.endswith('.png'): 
                    # print(filename)
                    
                    if not os.path.exists(image_dir):
                            os.mkdir(image_dir)
                        
                    source = zip_file.open(member)
                    target = open(os.path.join(image_dir, filename), "wb")
                    with source, target:
                        shutil.copyfileobj(source, target)            
                 
            if not filename:
                continue
          
           
def get_images(img_file,no_img):
  
    if os.path.isfile(img_file):
        return send_file(img_file)
    
    elif os.path.isfile(img_file.replace('jpg','png')):
        return send_file(img_file.replace('jpg','png'))
    
    elif os.path.isfile(img_file.replace('jpg','jpeg')):
        return send_file(img_file.replace('jpg','jpeg'))
    
    elif os.path.isfile(img_file.replace('jpg','jfif')):
        return send_file(img_file.replace('jpg','jfif'))
    
    elif os.path.isfile(img_file.replace('jpg','pjpeg')):
        return send_file(img_file.replace('jpg','pjpeg'))
    
    elif os.path.isfile(img_file.replace('jpg','pjp')):
        return send_file(img_file.replace('jpg','pjp'))
    
    elif os.path.isfile(img_file.replace('jpg','webp')):
        return send_file(img_file.replace('jpg','webp'))
    
    else:
        return send_file(no_img) 
    
# Need to change
def write_doc_for_download(document, data_type):
    if data_type == 'kvp':
        json_object = json.dumps(document['correctedData']['kvpData'])
        name = 'annotations/' + document['document_name']

    elif data_type == 'ocr':
        json_object = json.dumps(document['correctedData']['ocrData'])
        name = 'ocrs/' + document['document_name']

    elif data_type == 'checkbox':
        json_object = json.dumps(document['correctedData']['checkboxData'])
        name = 'checkbox_data/' + document['document_name'] +"_checkboxes"

    os.makedirs(os.path.dirname(name), exist_ok=True)
    with open("" + name + ".json", "w") as outfile:
        outfile.write(json_object)


def download_batch(data,raw_data):                            
        rem = ('annotations', 'ocrs', 'checkbox_data')
        type = data[0]['type']
        # print('type: ', type)
        # print(data)
        for document in data:
            document['_id'] = str(document['_id'])

            if 'checkboxes' in type and 'fields' in type:
                write_doc_for_download(document, 'checkbox')
                write_doc_for_download(document, 'ocr')
                write_doc_for_download(document, 'kvp')

            elif 'checkboxes' in type:
                write_doc_for_download(document, 'checkbox')
                write_doc_for_download(document, 'ocr')
                
            elif 'fields' in type:
                write_doc_for_download(document, 'kvp')

        path = os.getcwd()

        with ZipFile(""+raw_data['batch_name']+'.zip', 'w') as zip:
            for folder in os.listdir(path):
                if folder in rem:
                    for filename in os.listdir(os.path.join(path, folder)):
                        zip.write(folder+ '/' +filename, folder+ '/' +filename, ZIP_DEFLATED)

        return_file = BytesIO()

        with open(path + "/" + raw_data['batch_name']+'.zip', 'rb') as fz:
            return_file.write(fz.read())

        return_file.seek(0)

        # rem = ('.json', '.zip')
        for dir in rem:
            if os.path.isdir(os.getcwd() + '/' + dir):
                shutil.rmtree(dir)
        for filename in os.listdir(path):
            if filename.endswith('.zip'):
                os.remove(filename)
        return return_file