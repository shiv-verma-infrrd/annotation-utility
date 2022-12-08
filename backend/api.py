# from flask import Flask, request, jsonify, Response, json
# from flask_jwt_extended import JWTManager, jwt_required, create_access_token
# from pymongo import MongoClient

# client = MongoClient("mongodb://localhost:27017/")
# database = client["CorrectionUI"]
# user = database["Users"]

# app = Flask(__name__)
# jwt = JWTManager(app)

# app.config["JWT_SECRET_KEY"] = "key"

# @app.route("/api/register", methods=["POST"])
# def register():
#     email = request.form["email"]
#     test = user.find_one({"email": email})
#     if test:
#         return jsonify(message="User Already Exist"), 409
#     else:
#         name = request.form["name"]
#         password = request.form["password"]
#         user_info = dict(name=name, email=email, password=password)
#         user.insert_one(user_info)
#         return jsonify(message="User added sucessfully"), 201

# @app.route("/api/login", methods=["POST"])
# def login():
#     if request.is_json:
#         email = request.json["email"]
#         password = request.json["password"]
#     else:
#         email = request.form["email"]
#         password = request.form["password"]

#     test = user.find_one({"email": email,"password":password})
#     if test:
#         access_token = create_access_token(identity=email)
#         return jsonify(message="Login Succeeded!", access_token=access_token), 201
#     else:
#         return jsonify(message="Bad Email or Password"), 401

# class MongoAPI:
#     def __init__(self, collection):
#         self.client = MongoClient("mongodb://localhost:27017/")
#         database = 'CorrectionUI'
#         cursor = self.client[database]
#         self.collection = cursor[collection]
        
#     def read(self):
#         documents = self.collection.find()
#         output = [{item: data[item] for item in data} for data in documents]
#         return output

# @app.route('/api/batches', methods=['GET'])
# @jwt_required()
# def batches_read():
#     obj1 = MongoAPI('Batches')
#     response = {"batchList": obj1.read()}
#     return Response(response=json.dumps(response, default=str),
#                     status=200,
#                     mimetype='application/json')


# if __name__ == '__main__':
#     app.run(host="localhost", debug=True)
from flask import Flask,Response,request,jsonify
import pymongo
import json
from bson.objectid import ObjectId
from flask_cors import CORS

app = Flask(__name__)

api_v1_cors_config = {
  "origins":"*"
}

CORS(app,resources={
  r"/*":api_v1_cors_config
})


try:
  mongo = pymongo.MongoClient(
    host="mongodb+srv://admin:1234@cluster0.p6bfznx.mongodb.net/test",
    port=27017,
    serverSelectionTimeoutMS = 100
    )
  
  db = mongo.CorrectionUI

  mongo.server_info()

except:
 print("Error - cannot connet to db")

###################################################

#Fetching all batches

@app.route('/batches',methods=["GET"])

def get_batches():
  try:
    data = list(db.batches.find())
   # print(data)
    for batch in data:
        batch['_id'] = str(batch['_id'])
    return Response(
          response= json.dumps(data),
          status=200,
          mimetype="application/json"
      )

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

#  Fetch all documents

@app.route("/documents",methods=['GET'])

def get_documents():
   
    try:
      data = list(db.documents.find())
      
      for document in data:
        document['_id'] = str(document["_id"])

      return Response(
          response= json.dumps(data),
          status=200,
          mimetype="application/json"
      )
    except Exception as ex:
        print(ex)
    
###################################################

# Fetch Documents list using batchId

@app.route("/documents/<id>",methods=["GET"])

def get_single_documents(id):
  
    try:
      data = list(db.documents.find({"batchId":id}))
      #print(data)
      
      for document in data:
        document['_id'] = str(document["_id"])

      return Response(
          response= json.dumps(data),
          status=200,
          mimetype="application/json"
      )
    except Exception as ex:
        print(ex)
    
###################################################

#Fetching pages using document Id

@app.route("/pages/<id>",methods=["GET"])

def get_kvp_data(id):
   
    try:
      data = list(db.pages.find({"documentId":id}))
      
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

# updating page using raw data

@app.route("/pages",methods=["PUT"])
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

###################################################

if __name__ == "__main__":
    app.run(port=80,debug=True)