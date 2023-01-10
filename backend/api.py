from io import BytesIO
import json
import os
import shutil
from zipfile import ZIP_DEFLATED, ZipFile
from bson import ObjectId
from flask import Flask, Response, jsonify, make_response, request, send_file
from flask_cors import CORS
from flask_login import (
    LoginManager,
    UserMixin,
    login_required,
    login_user,
    logout_user,
)
import pymongo
import utils
from flask_swagger_ui import get_swaggerui_blueprint
import uuid
from flask_principal import Principal, Permission, RoleNeed, Identity

app = Flask(__name__)

app.config['ENV'] = "development"
# print(app.config["ENV"])

if app.config['ENV'] == "production":
    app.config.from_object("config.ProductionConfig")
elif app.config['ENV'] == 'testing':
    app.config.from_object("config.TestingConfig")
else:
    app.config.from_object("config.DevelopmentConfig")

try:
    mongo = pymongo.MongoClient(
        host=app.config['HOST'],
        port=27017,
        serverSelectionTimeoutMS=100
    )

    # print('Connected')
    db = mongo[app.config['DB_NAME']]
    users = db.Users
    # print('Connected')
    mongo.server_info()

except:
    print("Error - cannot connect to db")

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.session_protection = "strong"

cors = CORS(
    app,
    resources={r"*": {"origins": "http://localhost:4200"}},
    supports_credentials=True,
)

class User(UserMixin):
    ...

principals = Principal()
admin_permission = Permission(RoleNeed('admin'))

SWAGGER_URL = '/api/docs'
API_URL = '/static/swagger.yml'

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "API Documentation"
    }
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

@login_manager.user_loader
def user_loader(id):
    user = utils.get_user(id, users)
    if user:
        user_model = User()
        user_model.id = user["_id"]
        
        # Identify and set user role
        role = user['role']
        identity = Identity(user["_id"])
        identity.provides.add(RoleNeed(role))
        principals.set_identity(identity=identity)

        return user_model
    return None


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
            email=user_query['email']
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
    # print('Entered batches')
    try:
        data = list(db.batches.find())
        # data = list(db.batches.find({'allocatedTo': userId}))
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
def get_kvp_data_one(id):

    try:
        data = list(db.pages.find({"batchId": str(id)}, {'Data':0, 'correctedData':0}))

        return Response(
            response=json.dumps(data,default=str),
            status=200,
            mimetype="application/json"
        )
    except Exception as ex:
        print(ex)


@app.route("/pages/<batchId>/<docId>", methods=["GET"])
@login_required
def get_kvp_data(batchId, docId):

    try:
        
        data = list(db.pages.find(
            {"documentId": str(docId), "batchId": str(batchId)}))

        
        if data[0]['type'] == "checkboxes":    
            if str(data[0]["isCorrected"]).lower() == 'true':
                # print(data[0]['correctedData']['ocrData']['form'])
                form = utils.transform_data_for_corrected_data(data[0]['correctedData']['ocrData'])
                data[0]['correctedData']['ocrData'] = form
                
            else:
                form = utils.transform_data(data[0]['Data']['ocrData'],data[0]['Data']['checkboxData'])
                data[0]['Data']['ocrData'] = form

        return Response(
            response=json.dumps(data,default=str),
            status=200,
            mimetype="application/json"
        )
    except Exception as ex:
        print(ex)


@app.route('/<batchId>/<image>', methods=['GET'])
@login_required
def myapp(batchId, image):
  
    img_file = os.path.join(app.config['IMAGE_PATH'],f'{batchId}/{image}.jpg')
    no_img =  os.path.join(app.config['IMAGE_PATH'],f'no-preview.png')
    # print("###############",img_file)
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




@app.route("/pages", methods=["PUT"])
@login_required
def put_ocr_data():

    try:
        raw_data = request.json
        
        
        if raw_data["type"] == "checkboxes":
            data = raw_data['correctedData']['ocrData']
            # print("inside****")
            # print(data)
            transformed_data = utils.retransform_data(data)   
            raw_data['correctedData']['ocrData'] = transformed_data
        
        db.pages.update_one({"_id": ObjectId(raw_data['_id'])}, {"$set": {
            
            "isCorrected": raw_data['isCorrected'],
            # "imageStatus": raw_data['imageStatus'],
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



@app.route('/downloads', methods=['POST'])
@login_required
def send_zip_file():
    try:
        raw_data = request.json
        data = list(db.pages.find({"batchId": str(raw_data['batchId'])}))
        name = ""
        type = data[0]['type']
        # print('type: ', type)
        # print(data)
        for batch in data:
            
            # print(batch['correctedData']['kvpData'])
            batch['_id'] = str(batch['_id'])
            if type == 'checkboxes':
                name = batch['document_name'] +"_checkboxes"
                json_object = json.dumps(batch['correctedData']['checkboxData'])
                json_object2 = json.dumps(batch['correctedData']['ocrData'])
                with open(""+name+".json", "w") as outfile:
                   outfile.write(json_object)
                with open(""+batch['document_name']+".json", "w") as outfile:
                   outfile.write(json_object2)
                
            elif type == 'fields':
                name = batch['document_name']
                json_object = json.dumps(batch['correctedData']['kvpData'])    
                with open(""+name+".json", "w") as outfile:
                   outfile.write(json_object)

        path = os.getcwd()

        with ZipFile(""+raw_data['batch_name']+'.zip', 'w') as zip:
            for filename in os.listdir(path):
                if type == 'fields':
                    if filename.endswith(".json"):
                        print(filename)
                        zip.write(filename, raw_data['batch_name']+"_output/"+filename, ZIP_DEFLATED)
                elif type == 'checkboxes':
                    if filename.endswith("_checkboxes.json"):
                        print(filename)
                        zip.write(filename, "checkbox_data/"+filename, ZIP_DEFLATED)
                    elif filename.endswith(".json"):
                        print(filename)
                        zip.write(filename, "ocrs/"+filename, ZIP_DEFLATED)

        return_file = BytesIO()

        with open(path + "/" + raw_data['batch_name']+'.zip', 'rb') as fz:
            return_file.write(fz.read())

        return_file.seek(0)

        rem = ('.json', '.zip')
        for filename in os.listdir(path):
            if filename.endswith(rem):
                os.remove(filename)

        resp = make_response(
            send_file(return_file, mimetype='application/zip'))
        resp.headers['content-disposition'] = 'attachment; filename=' + \
            raw_data['batch_name']+'.zip'
        resp.headers['content-type'] = 'application/zip'
        return resp
    except Exception as ex:
        print(ex)
        return Response(
            response=json.dumps({"Message": "File cannot be downloaded"}),
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
        dbResponse = db.batches.delete_one({"batchId": str(id)})
        dbResponse2 = db.pages.delete_many({"batchId": str(id)})
        
        path = os.path.join(app.config['IMAGE_PATH'] ,f'{str(id)}')
        shutil.rmtree(path)
        return Response(
            response=json.dumps({"Message": "Batch deleted", "id": f"{id}"}),
            status=200,
            mimetype="application/json"
        )
    except Exception as ex:
        print(ex)
        return Response(
            response=json.dumps({"Message": "File cannot be deleted"}),
            status=500,
            mimetype="application/json"
        )


#########################################################################

@app.route("/uploads", methods=["POST"])
@login_required
def upload_zip():

    try:
        zip_file = request.files['zip_file']
        zip_file_name = os.path.splitext(zip_file.filename)[0]

        if zip_file:
            extention = os.path.splitext(zip_file.filename)[1]

            if extention != app.config['ALLOWED_EXTENTIONS']:
                return Response(
                    response=json.dumps({"Message": "Not a .zip file"}),
                    status=200,
                    mimetype="application/json"
                )

            batch_id = uuid.uuid4()
            # print("***id****",batch_id)
            
            utils.extract_file(zip_file,db,batch_id,app.config['IMAGE_PATH'])
            utils.push_json_data_in_db(batch_id, db,app.config['IMAGE_PATH'] )
            utils.remove_filesystem_folder(batch_id,app.config['IMAGE_PATH'])
            
        return Response(
            response=json.dumps({"Message": "File Uploaded Successfully"}),
            status=200,
            mimetype="application/json"
        )

    except Exception as ex:
        print(ex)
        return Response(
            response=json.dumps({"Message": "File cannot be Uploaded "}),
            status=500,
            mimetype="application/json"
        )

#### Admin APIs ####
#### Admin APIs ####
@app.route("/users", methods=["GET"])
@login_required
@admin_permission.require()
def get_users():
    try:
        data = list(db.Users.find())
        return Response(response=json.dumps(data, default=str),
                        status=200,
                        mimetype="application/json")

    except Exception as ex:
        print(ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot read users",
                }),
            status=500,
            mimetype="application/json"
        )
        
 
@app.route("/create_user", methods=["POST"])
def create_user():
    try:
        # print(request.form['name'])
        new_user = {
                    "user_id": str(uuid.uuid4()),
                    "name" : request.form['name'],
                    "user_name" : request.form['user_name'], 
                    "email":request.form['email'],
                    "password" : request.form['password'],
                    "role" : request.form['role'] 
                }
        
        db.Users.insert_one(new_user)
        return Response(
                    response=json.dumps(
                        {
                            "message": " new user created sucessfully",
                        }),
                    status=200,
                    mimetype="application/json"
                )
    except Exception as ex:
        print(ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot create new user",
                }),
            status=500,
            mimetype="application/json"
        )   
        
@app.route("/delete_user",methods=["DELETE"])
def delete_user():
    try:
      
        data = request.json
        print(data['user_id'])
        u_id = data['user_id']
        dbResponse = db.Users.delete_one({"user_id": str(u_id) })
        print(dbResponse)
        return Response(
                    response=json.dumps(
                        {
                            "message": "User deleted sucessfully",
                        }),
                    status=200,
                    mimetype="application/json"
                )
    except Exception as ex:
        print(ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot delete new user",
                }),
            status=500,
            mimetype="application/json"
        )           

if __name__ == "__main__":
    app.run(debug=True, port=5000)
