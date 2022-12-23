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

app = Flask(__name__)
app.config.update(
    DEBUG=True,
    SECRET_KEY="secret",
    SESSION_COOKIE_HTTPONLY=True,
    REMEMBER_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_SAMESITE="None",
)


try:
  mongo = pymongo.MongoClient(
    host="mongodb+srv://admin:1234@cluster0.p6bfznx.mongodb.net/test",
    port=27017,
    serverSelectionTimeoutMS = 100
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

def get_user(user_id):
    for user in users.find():
        if user_id == str(user['_id']):
            return user
    return 'None'

@login_manager.user_loader
def user_loader(id):
    user = get_user(id)
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
          userId = str(user_query['_id']),
          username = user_query['name'],
          email = user_query['email'],
          userRole = user_query['isAdmin']
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
        data = list(db.batches.find({'allocatedTo':userId}))
        return Response(response=json.dumps(data, default=str),
                            status=200,
                            mimetype="application/json")

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

@app.route("/pages/<id>",methods=["GET"])
@login_required
def get_kvp_data_one(id):
   
    try:
      data = list(db.pages.find({"batchId":int(id)}))
      
      for ocrDataKvpUid in data:
        ocrDataKvpUid ['_id'] = str(ocrDataKvpUid ["_id"])

      return Response(
          response= json.dumps(data),
          status=200,
          mimetype="application/json"
      )
    except Exception as ex:
        print(ex)

@app.route("/documents",methods=['GET'])
@login_required
def get_documents():
   
    try:
      data = list(db.documents.find())
      
      return Response(response=json.dumps(data, default=str),
                        status=200,
                        mimetype="application/json")
    
    except Exception as ex:
        print(ex)

@app.route("/documents/<id>",methods=["GET"])
@login_required
def get_single_documents(id):
  
    try:
      data = list(db.documents.find({"batchId":id}))
      #print(data)
      
      return Response(response=json.dumps(data, default=str),
                        status=200,
                        mimetype="application/json")
    
    except Exception as ex:
        print(ex)

@app.route("/pages/<batchId>/<docId>",methods=["GET"])
@login_required
def get_kvp_data(batchId,docId):
   
    try:
      data = list(db.pages.find({"documentId":int(docId),"batchId":int(batchId)}))
      
      for ocrDataKvpUid in data:
        ocrDataKvpUid ['_id'] = str(ocrDataKvpUid ["_id"])

      return Response(
          response= json.dumps(data),
          status=200,
          mimetype="application/json"
      )
    except Exception as ex:
        print(ex)

@app.route('/<batchId>/<image>',methods=['GET'])
@login_required
def myapp(batchId, image):
    
    
    img_file = f'assets/{batchId}/{batchId}/images/{image}.png'
    if os.path.isfile(img_file):
      return send_file(img_file)

    img_file = f'assets/{batchId}/{batchId}/images/{image}.jpeg'
    if os.path.isfile(img_file):
      return send_file(img_file)     

    img_file = f'assets/{batchId}/{batchId}/images/{image}.jpg'  
    if os.path.isfile(img_file):
      return send_file(img_file)

    img_file = f'assets/{batchId}/{batchId}/images/{image}.webp'  
    if os.path.isfile(img_file):
      return send_file(img_file)

    img_file = f'assets/{batchId}/{batchId}/images/{image}.pdf'  
    if os.path.isfile(img_file):
      return send_file(img_file)

@app.route("/pages",methods=["PUT"])
@login_required
def put_ocr_data():

 try:    
    raw_data = request.json
    db.pages.update_one({"_id":ObjectId(raw_data['_id'])},{"$set":{
        #  "documentId": raw_data['documentId'],
         "document_name":raw_data['document_name'],
         "batchName" :raw_data['batchName'],
         "isCorrected": raw_data['isCorrected'] ,
         "imageStatus": raw_data['imageStatus'] ,
        #  "imagePath": raw_data['imageStatus'] ,
         'kvpData':raw_data['kvpData'],
         "correctedData": raw_data['correctedData'] ,
         "correctedBy": raw_data['correctedBy'] ,
         "correctedOn": raw_data['correctedOn'] 
    }})
    
    return Response(
          response= json.dumps({"Message": "Record Updated Sucessfully"}),
          status=200,
          mimetype="application/json"
      )

 except Exception as ex:
  print(ex)
  return  Response(
          response= json.dumps({"Message": "record not updated"}),
          status=500,
          mimetype="application/json"
      )

@app.route("/uploads",methods=["POST"])
@login_required
def upload_zip_files():
  try:
     file = request.files['file']
     extention = os.path.splitext(file.filename)[1]
     
     Db_data = list(db.pages.find())
         
  
     max_batch_id = []
     for x in Db_data:
 
        max_batch_id.append(x['batchId'])
 
     max_batch_id.sort()

     if len(Db_data) == 0:
        batch_id = 0
     else:  
        batch_id = max_batch_id[-1]  

     if file:

        if extention != app.config['ALLOWED_EXTENTIONS']:
           return Response(
            response= json.dumps({"Message": "Not a .zip file"}),
            status=200,
            mimetype="application/json"
            )

        upload_dir = os.path.join(
          app.config['ZIP_FILE_UPLOAD_DIRECTORY'],
          secure_filename(f"{batch_id + 1}.zip")
        )  

        file.save(upload_dir)

        extract_dir = os.path.join(
          app.config['ZIP_FILE_EXTRACT_DIRECTORY'],
          secure_filename(f"{batch_id + 1}")
        )
        
        with ZipFile(upload_dir, 'r') as zObject:

         zObject.extractall(
         path=extract_dir ) 
         
        os.remove(upload_dir) 
############ Inserting Pages data in Db ##################
        c = os.getcwd()
         
        d = f"assets\{batch_id + 1}"
         
        for file1 in os.listdir(d):
          #  print("*********"+file1)
           os.rename(os.path.join(d,file1),os.path.join(d,str(batch_id + 1)))  
          #  print("******"+file1)
        g = os.path.join(c,os.path.join(d,str(batch_id + 1)))
        #  print(g)
          
        #  file_dir = r'C:\Users\shivk\OneDrive\Desktop\1234\api\assets\806\annotations'
        curr_dt = datetime.now()
        docId = 0
        img_Id_array = []
        imgId = int(round(curr_dt.timestamp())*1000)
        docId_array = []
        file_dir = os.path.join(g,r'annotations')
        for filename in os.listdir(file_dir):
             f = os.path.join(file_dir, filename)
             if os.path.isfile(f):
                  with open(f) as file_1:
                       file_data = json.load(file_1)  
                    #  print(file_data)
                      #  print(os.path.splitext(filename)[0])
                       docId = docId + 1
                       imgId = imgId + 1
                       img_Id_array.append({"imgId":imgId})
                       docId_array.append({'docId':docId})
                       data = {   
                                  "imgid":imgId, 
                                  "batchId":batch_id + 1,
                                  "documentId":docId,
                                  "batchName": request.form['batch_name'],
                                  "document_name": str(os.path.splitext(filename)[0]),
                                  "isCorrected": "False",
                                  "imageStatus": "Not Corrected",
                                  "imagePath": f"/{batch_id + 1}/{os.path.splitext(filename)[0]}",
                                  "kvpData":file_data,
                                  "correctedData": { "form": []},
                                  "correctedBy": "",
                                  "correctedOn": ""

                                }
                       db.pages.insert_one(data)
                        
##################### Inserting Batches data in Db #######################
        b_data = {       
                          "batchId":batch_id + 1,
                          "batchName": request.form['batch_name'],
                          "documentCount": len(docId_array),
                          "img_Id": img_Id_array, 
                          "isCorrected": "False",
                          "allocatedBy": "admin",
                          "allocatedTo": str(request.form['user_id']),
                          "allocatedOn": "8/12/2022",
                          "createdOn": "8/12/2022",
                          "createdBy": "admin"
                     }
        db.batches.insert_one(b_data)            

        return  Response(
         response= json.dumps({"Message": "File Uploaded Successfully"}),
         status=200,
         mimetype="application/json"
          )     
  except Exception as ex:
    print(ex)
    return Response(
          response= json.dumps({"Message": "File not uploaded"}),
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
        # print(raw_data['batchId'])
        # print(raw_data['batch_name'])

        data = list(db.pages.find({"batchId":int(raw_data['batchId'])}))
        # print(data)

        for batch in data:
            batch['_id'] = str(batch['_id'])
            # print(batch['documentId'])

            # Serializing json
            json_object = json.dumps(batch['correctedData'])



            # Writing to sample.json
            with open("downloads/"+str(batch['documentId'])+".json", "w") as outfile:
                outfile.write(json_object)
        
        file_paths = []
      
        # crawling through directory and subdirectories
        for root, directories, files in os.walk("downloads"):
            for filename in files:
                # join the two strings in order to form the full filepath.
                filepath = os.path.join(root, filename)
                file_paths.append(filepath)
      
        # print('Following files will be zipped:')
        # for file_name in file_paths:
        #       # print(file_name)
                # writing files to a zipfile
        with ZipFile("zipfiles/"+raw_data['batch_name']+'.zip','w') as zip:
            # writing each file one by one
            for file in file_paths:
                zip.write(file)

            # print('All files zipped successfully!')
        
        c = os.getcwd()          
        d = f"zipfiles/{raw_data['batch_name']}.zip"
        download = os.path.join(c, d)

        for root, directories, files in os.walk("downloads"):
            for filename in files:
                # join the two strings in order to form the full filepath.
                filepath = os.path.join(root, filename)
                os.remove(filepath)

        return_file = BytesIO()  

        with open(download,'rb') as fz:
          return_file.write(fz.read())
        
        return_file.seek(0)
        os.remove(download)    
        # print(return_file.seek(0))     
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
def delete_user(id):
  try:
    dbResponse = db.batches.delete_one({"batchId":int(id)})
    dbResponse2 = db.pages.delete_many({"batchId":int(id)})
    path = os.path.join("assets/",str(id))
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

if __name__ == "__main__":
    app.run(debug=True, port=80)