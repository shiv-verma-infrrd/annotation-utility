from io import BytesIO
import json
import os
import shutil
from zipfile import ZIP_DEFLATED, ZipFile
from bson import ObjectId
from flask import Flask, Response, jsonify, make_response, redirect, render_template, request, send_file, url_for
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_required, login_user, logout_user
import pymongo
import logging
import utils
from flask_swagger_ui import get_swaggerui_blueprint
import uuid
from flask_principal import Principal, Permission, RoleNeed, Identity

app = Flask(__name__)

# app.config['ENV'] = "development"
# print(app.config["ENV"])
logging.basicConfig(filename='record.log', level=logging.DEBUG, format=f'%(asctime)s %(levelname)s %(name)s : %(message)s')

if app.config['ENV'] == "production":
    app.config.from_object("config.ProductionConfig")
elif app.config['ENV'] == 'testing':
    app.config.from_object("config.TestingConfig")
else:
    app.config.from_object("config.DevelopmentConfig")

try:
    mongo = pymongo.MongoClient(
        host=app.config['HOST'],
        port=app.config['PORT'],
        serverSelectionTimeoutMS=100
    )

    # print('Connected')
    db = mongo[app.config['DB_NAME']]
    users = db.Users
    # print('Connected')
    mongo.server_info()
    app.logger.info('Connected to the database successfully')

except Exception as ex:
    app.logger.warning('Cannot connect to database: %s', ex)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.session_protection = "strong"

cors = CORS(
    app,
    resources={r"*": {"origins":app.config['ALLOWED_URL'] }},
    supports_credentials=True,
)

class User(UserMixin):
    ...

principals = Principal()
admin_permission = Permission(RoleNeed('admin'))

SWAGGER_URL = app.config['SWAGGER_URL']
API_URL = app.config['API_URL']

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "API Documentation"
    }
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

@app.route("/")
def root():
    return render_template('index.html')

@app.route("/static/batches")
@login_required
def batches():
    return render_template('index.html')

@app.route("/static/login")
def login_route():
    return render_template('index.html')

@app.route("/static/documents")
@login_required
def documents():
    return render_template('index.html')

@app.route("/static/editing-page")
@login_required
def editing_page():
    return render_template('index.html')

@app.route("/static/admin")
@login_required
@admin_permission.require()
def admin():
    return render_template('index.html')

@app.route("/static/admin/batches")
@login_required
@admin_permission.require()
def admin_batches():
    return render_template('index.html')


@app.route("/static/admin/users")
@login_required
@admin_permission.require()
def admin_users():
    return render_template('index.html')

@app.route("/static/admin/create_user")
@login_required
@admin_permission.require()
def admin_create_user():
    return render_template('index.html')


@app.errorhandler(404)
def page_not_found(e):
    return redirect(url_for('batches'))

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
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        app.logger.info('Input credentials: %s', data)

        user_query = users.find_one({"email": email, "password": password})
        if user_query:
            user_model = User()
            user_model.id = user_query['_id']
            login_user(user_model)
            return_data = jsonify(
                userId=str(user_query['_id']),
                username=user_query['name'],
                email=user_query['email'],
                role=user_query['role']
            )
            app.logger.info('Authentication Successful: Logging in user')
            return return_data, 200
    except Exception as ex:
        app.logger.info('Authentication Failed: %s', ex)
        return jsonify({"login": False})


@app.route("/logout", methods=["GET"])
@login_required
def logout():
    logout_user()
    app.logger.info('Logging out user')
    return jsonify({"logout": True})


@app.route("/batches/<userId>", methods=["GET"])
@login_required
def get_batches(userId):
    
    try:
        data = list(db.batches.find())
        # data = list(db.batches.find({'allocatedTo': userId}))
        app.logger.info('Returning batch data')
        return Response(response=json.dumps(data, default=str),
                        status=200,
                        mimetype="application/json")

    except Exception as ex:
        app.logger.exception('Failed to read batches : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot read batches",
                }),
            status=500,
            mimetype="application/json"
        )


@app.route("/pages/<batchId>", methods=["GET"])
@login_required
def get_batch_documents_list(batchId):

    try:
        data = list(db.pages.find({"batchId": str(batchId)}, {'Data':0, 'correctedData':0}))
        app.logger.info('Returning document list in batch: batch %s', batchId)
        return Response(
            response=json.dumps(data,default=str),
            status=200,
            mimetype="application/json"
        )
    except Exception as ex:
        print(ex)


@app.route("/pages/<batchId>/<docId>", methods=["GET"])
@login_required
def get_document_data(batchId, docId):

    try:
        
        data = list(db.pages.find(
            {"documentId": str(docId), "batchId": str(batchId)}))

        
        if data[0]['type'] == "checkboxes":    
            if str(data[0]["isCorrected"]).lower() == 'true':
                # print(data[0]['correctedData']['checkboxData'])
                form = utils.transform_data(data[0]['correctedData']['ocrData'],data[0]['correctedData']['checkboxData'])
                data[0]['correctedData']['ocrData'] = form
                
            else:
                form = utils.transform_data(data[0]['Data']['ocrData'],data[0]['Data']['checkboxData'])
                data[0]['Data']['ocrData'] = form

        app.logger.info('Returning document data: document %s', docId)
        return Response(
            response=json.dumps(data,default=str),
            status=200,
            mimetype="application/json"
        )
    except Exception as ex:
        app.logger.exception('Failed to read document data : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot read documents",
                }),
            status=500,
            mimetype="application/json"
        )


@app.route('/<batchId>/<image>', methods=['GET'])
@login_required
def send_image_file(batchId, image):
  
    img_file = os.path.join(app.config['IMAGE_PATH'],f'{batchId}/{image}.jpg')
    no_img =  os.path.join(app.config['IMAGE_PATH'],f'no-preview.png')
    # print("###############",img_file)
    send_data_file = utils.get_images(img_file,no_img)
    return send_data_file
    
@app.route('/image/<imageName>', methods=['GET'])
@login_required
def get_image(imageName):
    root_path = os.getcwd()
    img_file = root_path+f'/static/images/{imageName}'
    if os.path.isfile(img_file):
        return send_file(img_file)

@app.route("/pages", methods=["PUT"])
@login_required
def put_document_data():

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
        app.logger.exception('Failed to update document data : %s', ex)
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
       
        return_file = utils.download_batch(data,raw_data)
        
        resp = make_response(
            send_file(return_file, mimetype='application/zip'))
        
        resp.headers['content-disposition'] = 'attachment; filename=' + \
            raw_data['batch_name']+'.zip'
        resp.headers['content-type'] = 'application/zip'
        
        app.logger.info('Batch downloaded')
        return resp
    except Exception as ex:
        app.logger.exception('Batch download failed : %s', ex)
        return Response(
            response=json.dumps({"Message": "File cannot be downloaded"}),
            status=500,
            mimetype="application/json"
        )
        
        
#################################################################
#################################################################
################ Delete Btaches #################################


@app.route("/batch/<batchId>", methods=["DELETE"])
@login_required
def delete_batches(batchId):
    try:
        dbResponse = db.batches.delete_one({"batchId": str(batchId)})
        dbResponse2 = db.pages.delete_many({"batchId": str(batchId)})
        
        path = os.path.join(app.config['IMAGE_PATH'] ,f'{str(batchId)}')
        shutil.rmtree(path)
        app.logger.info('Batch Deleted : batch %s', )
        return Response(
            response=json.dumps({"Message": "Batch deleted", "id": f"{batchId}"}),
            status=200,
            mimetype="application/json"
        )
    except Exception as ex:
        app.logger.exception('Failed to delete batch : %s', ex)
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
            
        app.logger.info('Batch Uploaded')
        return Response(
            response=json.dumps({"Message": "File Uploaded Successfully"}),
            status=200,
            mimetype="application/json"
        )

    except Exception as ex:
        app.logger.exception('Batch upload failed : %s', ex)
        return Response(
            response=json.dumps({"Message": "File cannot be Uploaded "}),
            status=500,
            mimetype="application/json"
        )

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
        app.logger.exception('Failed to return users list : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot read users",
                }),
            status=500,
            mimetype="application/json"
        )
        
 
@app.route("/create_user", methods=["POST"])
@login_required
@admin_permission.require()
def create_user():
    try:
        # print(request.form['name'])
        new_user = {
                    "user_id": str(uuid.uuid4()),
                    "name" : request.form['name'],
                    "user_name" : request.form['user_name'], 
                    "email":request.form['email'],
                    "password" : request.form['password'],
                    "role" : request.form['role'],
                    "team": "no team" 
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
        app.logger.exception('New user creation failed : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot create new user",
                }),
            status=500,
            mimetype="application/json"
        )   
        
@app.route("/delete_user/<id>",methods=["DELETE"])
@login_required
@admin_permission.require()
def delete_user(id):
    try:
      
        # data = request.json
        # print(data['user_id'])
        # u_id = data['user_id']
        dbResponse = db.Users.delete_one({"_id": ObjectId(id) })
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
        app.logger.exception('Failed to delete user : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot delete new user",
                }),
            status=500,
            mimetype="application/json"
        ) 
        
@app.route("/create_team", methods=["POST"])
@login_required
@admin_permission.require()
def create_team():
    try:
        # print(request.form['name'])
        data = request.json
        
        new_user = {
                    "team_id": str(uuid.uuid4()),
                    "team_name" : data['team_name'] ,
                    "users": data['users']
                  }
        
        db.Teams.insert_one(new_user)
        return Response(
                    response=json.dumps(
                        {
                            "message": " Team created sucessfully",
                        }),
                    status=200,
                    mimetype="application/json"
                )
    except Exception as ex:
        app.logger.exception('Failed to create team : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot create Team",
                }),
            status=500,
            mimetype="application/json"
        )   
         
                  

if __name__ == "__main__":
    app.run(debug=True, port=8008)
