from flask import Flask, Response, request, jsonify, send_file
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
import pymongo
import json
from bson.objectid import ObjectId
from flask_cors import CORS

app = Flask(__name__)
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


###################################################

#Fetching all batches

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

#  Fetch all documents

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

# Fetch Documents list using batchId

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

#Fetching pages using document Id

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

@app.route('/image/<batchId>/<image>')
def myapp(batchId, image):
    image = "./assets/" + str(batchId) + "/" + str(image)
    return send_file(image, mimetype='image/jpg')

###################################################

# updating page using raw data

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

###################################################

if __name__ == "__main__":
    app.run(port=5000,debug=True)