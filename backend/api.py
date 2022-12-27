from datetime import datetime
from io import BytesIO
import json
import os
import shutil
from zipfile import ZipFile
from bson import ObjectId
from flask import Flask, Response, jsonify, make_response, request, send_file
from flask_cors import CORS
from flask_login import (
    LoginManager,
    UserMixin,
    current_user,
    login_required,
    login_user,
    logout_user,
)
from flask_wtf.csrf import CSRFProtect, generate_csrf
import pymongo
from werkzeug.utils import secure_filename
import utils
from PIL import Image

app = Flask(__name__)
app.config["ENV"] = "development"
print(app.config["ENV"])

if app.config['ENV'] == "production":
    app.config.from_object("config.ProductionConfig")
elif app.config['ENV'] == 'testing':
    app.config.from_object("config.TestingConfig")
else:
    app.config.from_object("config.DevelopmentConfig")

app.config.update(
    DEBUG=True,
    SECRET_KEY="secret",
    SESSION_COOKIE_HTTPONLY=True,
    REMEMBER_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_SAMESITE="None",
)

# api_v1_cors_config = {
#     "origins": "*"
# }

# CORS(app, resources={
#     r"/*": api_v1_cors_config
# })

try:
    mongo = pymongo.MongoClient(
        host="mongodb+srv://admin:1234@cluster0.p6bfznx.mongodb.net/test",
        port=27017,
        serverSelectionTimeoutMS=100
    )

    print('Connected')
    db = mongo.CorrectionUIdb2
    users = db.Users
    print('Connected')
    mongo.server_info()

except:
    print("Error - cannot connet to db")

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.session_protection = "strong"

csrf = CSRFProtect(app)
cors = CORS(
    app,
    resources={r"*": {"origins": "http://localhost:4200"}},
    expose_headers=["Content-Type", "X-CSRFToken"],
    supports_credentials=True,
)


class User(UserMixin):
    ...


@login_manager.user_loader
def user_loader(id):
    user = utils.get_user(id, users)
    if user:
        user_model = User()
        user_model.id = user["_id"]
        return user_model
    return None


@app.route("/ping", methods=["GET"])
@login_required
def home():
    return jsonify({"ping": "pong!"})


@app.route("/getsession", methods=["GET"])
def check_session():
    if current_user.is_authenticated:
        return {"login": True}

    return {'login': False}


@app.route("/getcsrf", methods=["GET"])
def get_csrf():
    token = generate_csrf()
    response = jsonify({"detail": "CSRF cookie set"})
    response.headers.set("X-CSRFToken", token)
    return response


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user_query = users.find_one({"email": email, "password": password})
    if user_query:
        user_model = User()
        user_model.id = user_query['_id']
        login_user(user_model)
        return_data = jsonify(
            userId=str(user_query['_id']),
            username=user_query['name'],
            email=user_query['email'],
            userRole=user_query['isAdmin']
        )
        return return_data, 200

    return jsonify({"login": False})


@app.route("/logout", methods=["GET"])
@login_required
def logout():
    logout_user()
    return jsonify({"logout": True})


@app.route("/batches/<userId>", methods=["GET"])
@login_required
def get_batches(userId):
    print('Entered batches')
    try:
        data = list(db.batches.find({'allocatedTo': userId}))
        return Response(response=json.dumps(data, default=str),
                        status=200,
                        mimetype="application/json")

    except Exception as ex:
        print(ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot read batches",
                }),
            status=500,
            mimetype="application/json"
        )


@app.route("/pages/<id>", methods=["GET"])
@login_required
def get_kvp_data_one(id):

    try:
        data = list(db.pages.find({"batchId": int(id)}))

        for ocrDataKvpUid in data:
            ocrDataKvpUid['_id'] = str(ocrDataKvpUid["_id"])

        return Response(
            response=json.dumps(data),
            status=200,
            mimetype="application/json"
        )
    except Exception as ex:
        print(ex)


@app.route("/documents", methods=['GET'])
@login_required
def get_documents():

    try:
        data = list(db.documents.find())

        return Response(response=json.dumps(data, default=str),
                        status=200,
                        mimetype="application/json")

    except Exception as ex:
        print(ex)


@app.route("/documents/<id>", methods=["GET"])
@login_required
def get_single_documents(id):

    try:
        data = list(db.documents.find({"batchId": id}))
        # print(data)

        return Response(response=json.dumps(data, default=str),
                        status=200,
                        mimetype="application/json")

    except Exception as ex:
        print(ex)


@app.route("/pages/<batchId>/<docId>", methods=["GET"])
@login_required
def get_kvp_data(batchId, docId):

    try:
        data = list(db.pages.find(
            {"documentId": int(docId), "batchId": int(batchId)}))

        for ocrDataKvpUid in data:
            ocrDataKvpUid['_id'] = str(ocrDataKvpUid["_id"])

        return Response(
            response=json.dumps(data),
            status=200,
            mimetype="application/json"
        )
    except Exception as ex:
        print(ex)


@app.route('/<batchId>/<image>',methods=['GET'])
# @login_required
def myapp(batchId,image):
    img_file = f'../assets/{batchId}/{batchId}/images/{image}.jpg'
    if os.path.isfile(img_file):
      return send_file(img_file)
    return "shiv"


@app.route("/pages", methods=["PUT"])
@login_required
def put_ocr_data():

    try:
        raw_data = request.json
        db.pages.update_one({"_id": ObjectId(raw_data['_id'])}, {"$set": {
            #  "documentId": raw_data['documentId'],
            "document_name": raw_data['document_name'],
            "batchName": raw_data['batchName'],
            "isCorrected": raw_data['isCorrected'],
            "imageStatus": raw_data['imageStatus'],
            #  "imagePath": raw_data['imageStatus'] ,
            'kvpData': raw_data['kvpData'],
            "correctedData": raw_data['correctedData'],
            "correctedBy": raw_data['correctedBy'],
            "correctedOn": raw_data['correctedOn']
        }})

        return Response(
            response=json.dumps({"Message": "Record Updated Sucessfully"}),
            status=200,
            mimetype="application/json"
        )

    except Exception as ex:
        print(ex)
        return Response(
            response=json.dumps({"Message": "record not updated"}),
            status=500,
            mimetype="application/json"
        )

#################################################################
############## downloading file using batch name ###############
@app.route('/downloads',methods=['POST'])
@login_required
def send_zip_file():
    try:
        raw_data = request.json
        data = list(db.pages.find({"batchId":int(raw_data['batchId'])}))
      
        for batch in data:

            batch['_id'] = str(batch['_id'])
            json_object = json.dumps(batch['correctedData'])
            with open(""+str(batch['documentId'])+".json", "w") as outfile:
                outfile.write(json_object)
  
        path = os.getcwd()

        with ZipFile(""+raw_data['batch_name']+'.zip','w') as zip:
           for filename in os.listdir(path):
                if filename.endswith(".json"):
                  print(filename)
                  zip.write(filename)
                  
        return_file = BytesIO()  

        with open(path +"/"+ raw_data['batch_name']+'.zip','rb') as fz:
          return_file.write(fz.read())
        
        return_file.seek(0)
        
        rem = ('.json','.zip')
        for filename in os.listdir(path):
             if filename.endswith(rem):
               os.remove(filename)          
                    
        resp = make_response(send_file(return_file, mimetype='application/zip'))
        resp.headers['content-disposition'] = 'attachment; filename='+raw_data['batch_name']+'.zip' 
        resp.headers['content-type'] = 'application/zip'       
        return resp
    except Exception as ex:
        print(ex)
        return Response(
          response= json.dumps({"Message": "File cannot be downloaded"}),
          status=500,
          mimetype="application/json"
         )   
#################################################################
#################################################################
################ Delete Btaches #################################


@app.route("/batch/<id>", methods=["DELETE"])
@login_required
def delete_batches(id):
  try:
    dbResponse = db.batches.delete_one({"batchId":int(id)})
    dbResponse2 = db.pages.delete_many({"batchId":int(id)})
    dbResponse3 = db.checkboxes.delete_many({"batchId":int(id)})
    path = os.path.join("../assets/",str(id))
    shutil.rmtree(path)
    return Response(
          response= json.dumps({"Message": "Batch deleted","id":f"{id}"}),
          status=200,
          mimetype="application/json"
         ) 
  except Exception as ex: 
    print(ex)
    return Response(
          response= json.dumps({"Message": "File cannot be deleted"}),
          status=500,
          mimetype="application/json"
         )
    
#########################################################################

def image_to_jpg(batch_id,zip_file_name):
        directory = f'../assets/{batch_id}/{batch_id}/images'
              
        for filename in os.listdir(directory):
                      if not filename.endswith('jpg'):
                          exten = filename.rsplit('.',1)[-1]
                          im = Image.open(os.path.join(directory, filename))
                          name= os.path.join(directory, filename.replace(exten,'jpg'))
                          rgb_im = im.convert('RGB')
                          rgb_im.save(name)
                          os.remove(os.path.join(directory, filename))
                          
def extract_file(file_data,zp,batch_id):
  
          validEXt = ['JPG','PNG','JSON']
    
          for files in file_data:
          # print(files)
            ext = files.rsplit(".",1)[-1]
          # print(ext)  
            if ext.upper() in validEXt:
            # print(files)
              zp.extract(files,f'../assets/{batch_id}')

def get_batch_id():
        Db_data = list(db.batches.find())
         
        batch_id = 0
        
        for x in Db_data:
          if batch_id < x['batchId']:
            batch_id = x['batchId']
        return batch_id + 1
               
def rename_file(batch_id):
        directory = f"../assets/{batch_id}"
        for file1 in os.listdir(directory):
          os.rename(os.path.join(directory,file1),os.path.join(directory,str(batch_id)))

def get_last_file():
         di = f"../assets"
         last_file_id = 0
         for file1 in os.listdir(di): 
             if int(file1) > last_file_id:
               last_file_id = int(file1) 
         return last_file_id   
              
def remove_filesystem_folder(path):            
         shutil.rmtree(path)

def push_json_data_in_db(batch_id,doc_type):
        curr_dt = datetime.now()
        docId = 0
        imgId = int(round(curr_dt.timestamp())*1000)
        
        fld = ""
        if doc_type == 'checkboxes':
            fld = "ocr"
        else:
          fld = "annotations"
                 
        file_dir = f"../assets/{batch_id}/{batch_id}/{fld}"
        for filename in os.listdir(file_dir):
             f = os.path.join(file_dir, filename)
             if os.path.isfile(f):
                  with open(f) as file_1:
                       file_data = json.load(file_1)  
                    #  print(file_data)
                      #  print(os.path.splitext(filename)[0])
                       docId = docId + 1
                       imgId = imgId + 1
                       data = {   
                                  "imgid":imgId, 
                                  "batchId":batch_id ,
                                  "documentId":docId,
                                  "batchName": request.form['batch_name'],
                                  "document_name": str(os.path.splitext(filename)[0]),
                                  "isCorrected": "False",
                                  "imageStatus": "Not Corrected",
                                  "imagePath": f"/{batch_id}/{os.path.splitext(filename)[0]}",
                                   "Type":str(doc_type),
                                  
                                  
                                  "Data": {
                                      	"checkboxData":{},
                                      	"ocrData":file_data,
                                        "kvpData":file_data,
                                         },
                              
                                   "correctedData": {
                                      	"checkboxData" :{},
                                      	"ocrData":{},
                                    	  "kvpdata": {"form": []},
                                  },
                              

                                  "correctedData": { "form": []},
                                  "correctedBy": "",
                                  "correctedOn": ""

                                }
                       db.pages.insert_one(data)
                       
        if doc_type == 'checkboxes':               
          file_dir =  f"../assets/{batch_id}/{batch_id}/checkbox_data"              
          for filename in os.listdir(file_dir): 
                  f = os.path.join(file_dir, filename)
                  if os.path.isfile(f):
                    with open(f) as file_1:
                        file_data = json.load(file_1) 
                        
                        c_data = {
                              "batchId":batch_id,
                              "document_name":str(os.path.splitext(filename)[0]),
                              "checkboxes":file_data,  
                        } 
                        db.checkboxes.insert_one(c_data)          
##################### Inserting Batches data in Db #######################
        b_data = {       
                          "batchId":batch_id,
                          "batchName": request.form['batch_name'],
                          "documentCount": docId,
                          "Type":str(doc_type), 
                          "isCorrected": "False",
                          "allocatedBy": "admin",
                          "allocatedTo": request.form['user_id'],
                          "allocatedOn": "8/12/2022",
                          "createdOn": "8/12/2022",
                          "createdBy": "admin"
                     }
        db.batches.insert_one(b_data) 
                

@app.route("/uploads",methods=["POST"])
@login_required
def upload_zip():
      
    try:   
      zip_file = request.files['zip_file']
      zip_file_name = os.path.splitext(zip_file.filename)[0]
    
      if zip_file:
        extention = os.path.splitext(zip_file.filename)[1]

        if extention != app.config['ALLOWED_EXTENTIONS']:
              return Response(
                response= json.dumps({"Message": "Not a .zip file"}),
                status=200,
                mimetype="application/json"
                )
              
              
              
        batch_id = get_batch_id()    
       
        last_file_id = get_last_file()
                     
        with ZipFile(zip_file,mode='r') as zp:
          dirs = list(set([os.path.dirname(x) for x in zp.namelist()]))
          file_data = zp.namelist()
          
          
        #   folder_check = ['annotations','images','checkbox_data','ocr']
          
        #   for fld in dirs:
            
        #     fld_name = fld.rsplit('/',1)[-1]
        #     if fld_name in folder_check:
        #       print(fld_name," folder present")
          
          
          if len(dirs) == 2:
            
            if batch_id == last_file_id:
              path = os.path.join("../assets/",str(batch_id))
              remove_filesystem_folder(path)
            extract_file(file_data,zp,batch_id) 
            rename_file(batch_id) 
            image_to_jpg(batch_id,zip_file_name)
            
            push_json_data_in_db(batch_id,"form")
            
            path = f"../assets/{batch_id}/{batch_id}/annotations"
            remove_filesystem_folder(path)
            
          elif len(dirs) == 3:
            if batch_id == last_file_id:
              path = os.path.join("../assets/",str(batch_id))
              remove_filesystem_folder(path)
            extract_file(file_data,zp,batch_id)  
            rename_file(batch_id)
            image_to_jpg(batch_id,zip_file_name)
            push_json_data_in_db(batch_id,"checkboxes")
            
            path = f"../assets/{batch_id}/{batch_id}/checkbox_data"
            remove_filesystem_folder(path)
            
            path = f"../assets/{batch_id}/{batch_id}/ocr"
            remove_filesystem_folder(path)
               
          else:
            print("folder structure is not right")
            return Response(
                response= json.dumps({"Message": "Folder structure not right"}),
                status=200,
                mimetype="application/json"
                )       
       
        
        
      return Response(
              response= json.dumps({"Message": "File Uploaded Successfully"}),
              status=200,
              mimetype="application/json"
            )
      
    except Exception as ex: 
        print(ex)
        return Response(
              response= json.dumps({"Message": "File cannot be Uploaded "}),
              status=500,
              mimetype="application/json"
            )

############################################################################
@app.route("/checkboxes/<doc_name>", methods=["GET"])
@login_required
def get_checkboxes(doc_name):
  
    try:
      data = list(db.checkboxes.find({"document_name":str(doc_name)+"_checkboxes"}))
      
      return Response(
          response= json.dumps(data,default=str),
          status=200,
          mimetype="application/json"
         ) 
    except Exception as ex:
        print(ex)
        return Response(
            response= json.dumps(
                {
                    "message":"cannot read batches",
                }),
            status=500,
            mimetype="application/json"
        )  
if __name__ == "__main__":
    app.run(debug=True, port=80)
