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
    login_required,
    login_user,
    logout_user,
)
import pymongo
import utils

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

cors = CORS(
    app,
    resources={r"*": {"origins": "http://localhost:4200"}},
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


@app.route('/<batchId>/<image>', methods=['GET'])
# @login_required
def myapp(batchId, image):
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


@app.route('/downloads', methods=['POST'])
@login_required
def send_zip_file():
    try:
        raw_data = request.json
        data = list(db.pages.find({"batchId": int(raw_data['batchId'])}))

        for batch in data:

            batch['_id'] = str(batch['_id'])
            json_object = json.dumps(batch['correctedData'])
            with open(""+str(batch['documentId'])+".json", "w") as outfile:
                outfile.write(json_object)

        path = os.getcwd()

        with ZipFile(""+raw_data['batch_name']+'.zip', 'w') as zip:
            for filename in os.listdir(path):
                if filename.endswith(".json"):
                    print(filename)
                    zip.write(filename)

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
        dbResponse = db.batches.delete_one({"batchId": int(id)})
        dbResponse2 = db.pages.delete_many({"batchId": int(id)})
        dbResponse3 = db.checkboxes.delete_many({"batchId": int(id)})
        path = os.path.join("../assets/", str(id))
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

            batch_id = utils.generate_batch_id(db)

            with ZipFile(zip_file, mode='r') as zp:
                dirs = list(set([os.path.dirname(x) for x in zp.namelist()]))
                file_data = zp.namelist()

            #   folder_check = ['annotations','images','checkbox_data','ocr']

            #   for fld in dirs:

            #     fld_name = fld.rsplit('/',1)[-1]
            #     if fld_name in folder_check:
            #       print(fld_name," folder present")

                if len(dirs) == 2:
                    path = os.path.join("../assets/", str(batch_id))
                    if os.path.exists(path):
                        utils.remove_filesystem_folder(path)
                    utils.extract_file(file_data, zp, batch_id, 'form')
                    utils.rename_file(batch_id)
                    utils.image_to_jpg(batch_id, zip_file_name)

                    utils.push_json_data_in_db(batch_id, "form", db)

                    path = f"../assets/{batch_id}/{batch_id}/annotations"
                    utils.remove_filesystem_folder(path)

                elif len(dirs) == 3:
                    path = os.path.join("../assets/", str(batch_id))
                    if os.path.exists(path):
                        utils.remove_filesystem_folder(path)
                    utils.extract_file(file_data, zp, batch_id, 'checkbox')
                    utils.rename_file(batch_id)
                    utils.image_to_jpg(batch_id, zip_file_name)
                    print('renamed')
                    utils.push_json_data_in_db(batch_id, "checkboxes", db)

                    path = f"../assets/{batch_id}/{batch_id}/checkbox_data"
                    utils.remove_filesystem_folder(path)

                    path = f"../assets/{batch_id}/{batch_id}/ocrs"
                    utils.remove_filesystem_folder(path)

                else:
                    print("folder structure is not right")
                    return Response(
                        response=json.dumps(
                            {"Message": "Folder structure not right"}),
                        status=200,
                        mimetype="application/json"
                    )

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

############################################################################


@app.route("/checkboxes/<doc_name>", methods=["GET"])
@login_required
def get_checkboxes(doc_name):

    try:
        data = list(db.checkboxes.find(
            {"document_name": str(doc_name)+"_checkboxes"}))
        return Response(
            response=json.dumps(data, default=str),
            status=200,
            mimetype="application/json"
        )
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


if __name__ == "__main__":
    app.run(debug=True, port=5000)
