from datetime import datetime
import json
import os
import shutil
from PIL import Image
from flask import request


def get_user(user_id, users):
    for user in users.find():
        if user_id == str(user['_id']):
            return user
    return 'None'


def generate_batch_id(db):
    Db_data = list(db.batches.find({}, {'batchId': 1, '_id': 0}))
    print(Db_data)

    batch_id = 0
    for x in Db_data:
        if x['batchId'] > batch_id:
            batch_id = x['batchId']

    return batch_id + 1


def get_batch_type(path):
    dir_list = os.listdir(path)
    if len(dir_list) == 2:
        return 'form'
    elif len(dir_list) == 3:
        return 'checkbox'


def image_to_jpg(batch_id, zip_file_name):
    directory = f'../assets/{batch_id}/{batch_id}/images'

    for filename in os.listdir(directory):
        if not filename.endswith('jpg'):
            exten = filename.rsplit('.', 1)[-1]
            im = Image.open(os.path.join(directory, filename))
            name = os.path.join(directory, filename.replace(exten, 'jpg'))
            rgb_im = im.convert('RGB')
            rgb_im.save(name)
            os.remove(os.path.join(directory, filename))


def extract_file(file_data, zp, batch_id, type):

    validEXt = ['JPG', 'PNG', 'JSON']

    for files in file_data:
        print(files)
        ext = files.rsplit(".", 1)[-1]
        print(ext)
        if ext.upper() in validEXt:
            if type == 'form':
                zp.extract(files, f'../assets/{batch_id}')
            elif type == 'checkbox':
                zp.extract(files, f'../assets/{batch_id}/{batch_id}')
            # print(files)


def rename_file(batch_id):
    directory = f"../assets/{batch_id}"
    for file1 in os.listdir(directory):
        os.rename(os.path.join(directory, file1),
                  os.path.join(directory, str(batch_id)))


def get_last_file():
    di = f"../assets"
    last_file_id = 0
    for file1 in os.listdir(di):
        if int(file1) > last_file_id:
            last_file_id = int(file1)
    return last_file_id


def remove_filesystem_folder(path):
    shutil.rmtree(path)


def get_checkbox_data(path, file_name):
    file_name = file_name.split('.')[0]+'_checkboxes.json'
    path = '/'.join(path.split('/')[:-1]+['checkbox_data'])
    f = os.path.join(path, file_name)
    if os.path.isfile(f):
        with open(f) as file_1:
            file_data = json.load(file_1)
    return file_data


def push_json_data_in_db(batch_id, doc_type, db):
    curr_dt = datetime.now()
    docId = 0
    imgId = int(round(curr_dt.timestamp())*1000)

    fld = ""
    if doc_type == 'checkboxes':
        fld = "ocrs"
    else:
        fld = "annotations"

    file_dir = f"../assets/{batch_id}/{batch_id}/{fld}"
    for filename in os.listdir(file_dir):
        # print('fname: ',filename)
        f = os.path.join(file_dir, filename)
        if os.path.isfile(f):
            with open(f) as file_1:
                file_data = json.load(file_1)
        #  print(file_data)
        #  print(os.path.splitext(filename)[0])
                docId = docId + 1
                imgId = imgId + 1
                data = {
                    "imgid": imgId,
                    "batchId": batch_id,
                    "documentId": docId,
                    "batchName": request.form['batch_name'],
                    "document_name": str(os.path.splitext(filename)[0]),
                    "isCorrected": "False",
                    "imageStatus": "Not Corrected",
                    "imagePath": f"/{batch_id}/{os.path.splitext(filename)[0]}",
                    "Type": str(doc_type),
                    "correctedData": {
                        "checkboxData": {},
                        "ocrData": {},
                        "kvpdata": {},
                    },
                    "correctedBy": "",
                    "correctedOn": ""

                }
                print(fld)
                if fld == 'ocrs':
                    checkbox_data = get_checkbox_data(file_dir, filename)
                    image_data = {
                        "checkboxData": checkbox_data,
                        "ocrData": file_data,
                        "kvpData": {},
                    }
                elif fld == 'annotations':
                    image_data = {
                        "checkboxData": {},
                        "ocrData": {},
                        "kvpData": file_data,
                    }
                print(image_data)
                data['Data'] = image_data
                db.pages.insert_one(data)


##################### Inserting Batches data in Db #######################
    b_data = {
        "batchId": batch_id,
        "batchName": request.form['batch_name'],
        "documentCount": docId,
        "Type": str(doc_type),
        "isCorrected": "False",
        "allocatedBy": "admin",
        "allocatedTo": request.form['user_id'],
        "allocatedOn": "8/12/2022",
        "createdOn": "8/12/2022",
        "createdBy": "admin"
    }
    db.batches.insert_one(b_data)
    

def transform_data(file_data,checkbox_data):
        
        form = []
        question = checkbox_data['questions'][0]['token_indexes']
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
            
            if i in question:
                data["label"] = 'checkbox_question'      
           
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
                        "id" : _id + 1
                        }
                    
                    
                    entity = {
                        "box":[file_data[checkbox_data['checkboxes'][j]['token_indexes'][0]][1]['tl']['x'],
                               file_data[checkbox_data['checkboxes'][j]['token_indexes'][0]][1]['tl']['y'],
                               file_data[checkbox_data['checkboxes'][j]['token_indexes'][-1]][1]['br']['x'],
                               file_data[checkbox_data['checkboxes'][j]['token_indexes'][-1]][1]['br']['y']],
                        "label":"checkbox_string",
                        "linking":[_id,_id+1],
                        "id" : _id
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
                        form.pop()
                        if (_id - k) in question:
                            entity['question_id'] = (_id - k) 
                            checkbox['question_id'] = (_id - k)
                    # print(text)
                    # print(words) 
                      
                    entity['text'] = text
                    entity['words'] = words
                    # print(entity)
                    form.append(entity)
                    form.append(checkbox)
                     
                       
            
            
            
                
            # print(form)  
             
        return form        
    
    
