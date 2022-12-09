from flask import Flask,Response,request,jsonify,send_file
import pymongo
import json
from bson.objectid import ObjectId
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from zipfile import ZipFile
from datetime import datetime

app = Flask(__name__)

app.config['ZIP_FILE_UPLOAD_DIRECTORY'] = 'uploads/'
app.config['ZIP_FILE_EXTRACT_DIRECTORY'] = 'assets/'
app.config['ALLOWED_EXTENTIONS'] = '.zip' 
app.config['FILE_JSON_DIRECTORY'] = r"assets\annotations"

# jwt = JWTManager(app)

app.config["JWT_SECRET_KEY"] = "key"

api_v1_cors_config = {
    "origins": "*"
}

CORS(app, resources={
    r"/*": api_v1_cors_config
})


try:
  mongo = pymongo.MongoClient(
    host="mongodb+srv://admin:1234@cluster0.p6bfznx.mongodb.net/test",
    port=27017,
    serverSelectionTimeoutMS = 100
    )
  
  db = mongo.CorrectionUI
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

    test = user.find_one({"email": email, "password": password})
    if test:
        access_token = create_access_token(identity=email)
        return jsonify(message="Login Succeeded!", access_token=access_token), 200
    else:
        return jsonify(message="Bad Email or Password"), 400


########################################################
################# Fetching all batches #################

@app.route('/batches',methods=["GET"])
# @jwt_required()
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
# @jwt_required()
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
# @jwt_required()
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
######### Fetching pages using document Id ########

@app.route("/pages/<id>",methods=["GET"])
# @jwt_required()
def get_kvp_data(id):
   
    try:
      data = list(db.pages.find({"documentId":id}))
      
      return Response(response=json.dumps(data, default=str),
                        status=200,
                        mimetype="application/json")

    except Exception as ex:
        print(ex)
    
###################################################
################ serving image  ###################

@app.route('/image/<batchId>/<image>',methods=['GET'])
def myapp(batchId, image):
    image = f'assets/{batchId}/images/{image}.jpg'
    return send_file(image)

# @app.route('/images/<id>', methods=['GET'])
# def serve_img(id):
#   return send_file(f'assets/{id}/images/{id}.jpg')

###################################################
########### updating page using raw data ##########

@app.route("/pages",methods=["PUT"])
# @jwt_required()
def put_ocr_data():

 try:    
    raw_data = request.json
    db.testingPagesUpdates.update_one({"_id":ObjectId(raw_data['_id'])},{"$set":{
        #  "documentId": raw_data['documentId'],
         "isCorrected": raw_data['isCorrected'] ,
         "imageStatus": raw_data['imageStatus'] ,
         "imagePath": raw_data['imageStatus'] ,
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

@app.route("/uploads",methods=["POST"])
def upload_zip_files():
  try:
     file = request.files['file']
     extention = os.path.splitext(file.filename)[1]
     
     batch_list = os.listdir(app.config['ZIP_FILE_UPLOAD_DIRECTORY'])
    #  print(batch_list)
     
     new_batch_no = 0

     if  len(batch_list) != 0:
        last_uploaded_batch = batch_list[-1]
        new_batch_no = last_uploaded_batch[-5]
        print(last_uploaded_batch)
     print(new_batch_no)

     if file:

        if extention != app.config['ALLOWED_EXTENTIONS']:
           return Response(
            response= json.dumps({"Message": "Not a .zip file"}),
            status=200,
            mimetype="application/json"
            )

        upload_dir = os.path.join(
          app.config['ZIP_FILE_UPLOAD_DIRECTORY'],
          secure_filename(f"{int(new_batch_no) + 1}.zip")
        )  

        file.save(upload_dir)

        extract_dir = os.path.join(
          app.config['ZIP_FILE_EXTRACT_DIRECTORY'],
          secure_filename(f"{int(new_batch_no) + 1}")
        )
        
        with ZipFile(upload_dir, 'r') as zObject:

         zObject.extractall(
         path=extract_dir ) 

         c = os.getcwd()
         d = f'assets\\{int(new_batch_no) + 1}\\annotations'
         g = os.path.join(c,d)
          
        #  file_dir = r'C:\Users\shivk\OneDrive\Desktop\1234\api\assets\806\annotations'
         curr_dt = datetime.now()
         docId = int(round(curr_dt.timestamp())*1000)
         count = 0
         file_dir = os.path.join(c,d)
         for filename in os.listdir(file_dir):
             f = os.path.join(file_dir, filename)
             if os.path.isfile(f):
                  with open(f) as file_1:
                       file_data = json.load(file_1)  
                    #  print(file_data)
                      #  print(os.path.splitext(filename)[0])
                       docId = docId + 1
                       count = count + 1
                       
                       data = {
                                  "documentId": docId,
                                  "bId":int(new_batch_no) + 1,
                                  "isCorrected": "False",
                                  "imageStatus": "Not Corrected",
                                  "imagePath": f"assets/{int(new_batch_no) + 1}/images/{os.path.splitext(filename)[0]}.jpg",
                                  "kvpData":file_data,
                                  "correctedData": { "form": []},
                                  "correctedBy": "",
                                  "correctedOn": ""
                                }
                       db.testingPageTable.insert_one(data)
                        
                       

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