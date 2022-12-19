from flask import Flask,Response,request,jsonify,send_file
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
import pymongo
import json
from bson.objectid import ObjectId
from flask_cors import CORS,cross_origin
from werkzeug.utils import secure_filename
import os
from zipfile import ZipFile
from datetime import datetime

app = Flask(__name__)

app.config["ENV"] = "development"

print(app.config["ENV"])

if app.config['ENV'] == "production":
   app.config.from_object("config.ProductionConfig")
elif app.config['ENV'] == 'testing':
   app.config.from_object("config.TestingConfig")
else:
   app.config.from_object("config.DevelopmentConfig")   

# app.config['ZIP_FILE_UPLOAD_DIRECTORY'] = 'uploads/'
# app.config['ZIP_FILE_EXTRACT_DIRECTORY'] = 'assets/'
# app.config['ALLOWED_EXTENTIONS'] = '.zip' 
# app.config['FILE_JSON_DIRECTORY'] = r"assets\annotations"

jwt = JWTManager(app)

app.config["JWT_SECRET_KEY"] = "key"

api_v1_cors_config = {
    "origins": "*"
}

CORS(app, resources={
    r"/*": api_v1_cors_config
})


try:
  mongo = pymongo.MongoClient(
    host=app.config["HOST"],
    port=27017,
    serverSelectionTimeoutMS = 100
    )
  
  db = mongo.CorrectionUIdb2
  user = db.Users
  mongo.server_info()

except:
 print("Error - cannot connet to db")



@app.route("/login", methods=["POST"])
def login():
    if request.is_json:
        email = request.json["email"]
        password = request.json["password"]
    else:
        email = request.form["email"]
        password = request.form["password"]

    user_query = user.find_one({"email": email, "password": password})
    if user_query:
        access_token = create_access_token(identity=email)
        return_data = jsonify(
          accessToken=access_token,
          userId = str(user_query['_id']),
          username = user_query['name'],
          email = user_query['email'],
        )
        print('User: ', return_data)
        return return_data, 200
    else:
        return jsonify(message="Bad Email or Password"), 400


########################################################
################# Fetching all batches #################

@app.route('/batches',methods=["GET"])
@jwt_required()
def get_batches():
  try:
    data = list(db.batches.find())
    return Response(response=json.dumps(data, default=str),
                        status=200,
                        mimetype="application/json")

  except Exception as ex:
    print(ex)
    return Response(
          response= json.dumps(
            {
                "message":"cannot read users",
            }),
          status=500,
          mimetype="application/json"
      )
###################################################
############## Fetch all documents ################

@app.route("/documents",methods=['GET'])
@jwt_required()
def get_documents():
   
    try:
      data = list(db.documents.find())
      
      return Response(response=json.dumps(data, default=str),
                        status=200,
                        mimetype="application/json")
    
    except Exception as ex:
        print(ex)
    
###################################################
######### Fetch Documents list using batchId ######

@app.route("/documents/<id>",methods=["GET"])
@jwt_required()
def get_single_documents(id):
  
    try:
      data = list(db.documents.find({"batchId":id}))
      #print(data)
      
      return Response(response=json.dumps(data, default=str),
                        status=200,
                        mimetype="application/json")
    
    except Exception as ex:
        print(ex)

###################################################

#Fetching pages using document Id and batchId

@app.route("/pages/<batchId>/<docId>",methods=["GET"])

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

###################################################
######### Fetching pages using document Id ########

@app.route("/pages/<id>",methods=["GET"])

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

###################################################
################ serving image  ###################

@app.route('/<batchId>/<image>',methods=['GET'])
def myapp(batchId, image):
    image = f'assets/{batchId}/{batchId}/images/{image}.jpg'
    return send_file(image)    

# @app.route('/images/<id>', methods=['GET'])
# def serve_img(id):
#   return send_file(f'assets/{id}/images/{id}.jpg')

###################################################
########### updating page using raw data ##########

@app.route("/pages",methods=["PUT"])
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

####################################################################
############## Uploding zip files ##################################
######### and inserting zip data into Db ###########################

# @app.route("/uploads",methods=["POST"])
# def upload_zip_files():
#   try:
#      file = request.files['file']
#      extention = os.path.splitext(file.filename)[1]
     
#      batch_list = os.listdir(app.config['ZIP_FILE_UPLOAD_DIRECTORY'])
#     #  print(batch_list)
     
#      new_batch_no = 0

#      if  len(batch_list) != 0:
#         last_uploaded_batch = batch_list[-1]
#         new_batch_no = last_uploaded_batch[-5]
#         print(last_uploaded_batch)
#      print(new_batch_no)

#      if file:

#         if extention != app.config['ALLOWED_EXTENTIONS']:
#            return Response(
#             response= json.dumps({"Message": "Not a .zip file"}),
#             status=200,
#             mimetype="application/json"
#             )

#         upload_dir = os.path.join(
#           app.config['ZIP_FILE_UPLOAD_DIRECTORY'],
#           secure_filename(f"{int(new_batch_no) + 1}.zip")
#         )  

#         file.save(upload_dir)

#         extract_dir = os.path.join(
#           app.config['ZIP_FILE_EXTRACT_DIRECTORY'],
#           secure_filename(f"{int(new_batch_no) + 1}")
#         )
        
#         with ZipFile(upload_dir, 'r') as zObject:

#          zObject.extractall(
#          path=extract_dir ) 

#          c = os.getcwd()
#          d = f'assets\\{int(new_batch_no) + 1}\\806\\annotations'
#          g = os.path.join(c,d)
          
#         #  file_dir = r'C:\Users\shivk\OneDrive\Desktop\1234\api\assets\806\annotations'
#          curr_dt = datetime.now()
#          docId = int(round(curr_dt.timestamp())*1000)
#          count = 0
#          file_dir = os.path.join(c,d)
#          for filename in os.listdir(file_dir):
#              f = os.path.join(file_dir, filename)
#              if os.path.isfile(f):
#                   with open(f) as file_1:
#                        file_data = json.load(file_1)  
#                     #  print(file_data)
#                       #  print(os.path.splitext(filename)[0])
#                        docId = docId + 1
#                        count = count + 1
                       
#                        data = {
#                                   "documentId": docId,
#                                   "bId":int(new_batch_no) + 1,
#                                   "isCorrected": "False",
#                                   "imageStatus": "Not Corrected",
#                                   "imagePath": f"assets/{int(new_batch_no) + 1}/images/806/{os.path.splitext(filename)[0]}.jpg",
#                                   "kvpData":file_data,
#                                   "correctedData": { "form": []},
#                                   "correctedBy": "",
#                                   "correctedOn": ""
#                                 }
#                        db.pages.insert_one(data)
                        
                       

#          return  Response(
#          response= json.dumps({"Message": "File Uploaded Successfully"}),
#          status=200,
#          mimetype="application/json"
#           )     
#   except Exception as ex:
#     print(ex)
#     return Response(
#           response= json.dumps({"Message": "File not uploaded"}),
#           status=500,
#           mimetype="application/json"
#       ) 

@app.route("/uploads",methods=["POST"])
def upload_zip_files():
  try:
     file = request.files['file']
     extention = os.path.splitext(file.filename)[1]
     
    #  batch_list = os.listdir(app.config['ZIP_FILE_UPLOAD_DIRECTORY'])
    # #  print(batch_list)
     
    #  new_batch_no = 0

    #  if  len(batch_list) != 0:
    #     last_uploaded_batch = batch_list[-1]
    #     new_batch_no = last_uploaded_batch[-5]
    #     # print(last_uploaded_batch)
    #  print(new_batch_no)
     Db_data = list(db.pages.find())
         
      #  max_doc_id = []
     max_batch_id = []
     for x in Db_data:
    #  max_doc_id.append(x['documentId'])
        max_batch_id.append(x['batchId'])
  #  max_doc_id.sort()
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

############ Inserting Pages data in Db ##################
         c = os.getcwd()
         
         d = f"assets\{batch_id + 1}"
         
         for file1 in os.listdir(d):
           print("*********"+file1)
           os.rename(os.path.join(d,file1),os.path.join(d,str(batch_id + 1)))  
           print("******"+file1)
         g = os.path.join(c,os.path.join(d,str(batch_id + 1)))
         print(g)
          
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
                                  "document_name": request.form['batch_name'] + " docs " + str(docId),
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
                          "documentCount": len(data),
                          "img_Id": img_Id_array, 
                          "isCorrected": "False",
                          "allocatedBy": "admin",
                          "allocatedTo": "user-1",
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

#################################################################################

if __name__ == "__main__":
    app.run(port=80,debug=True)