import json
import os
import uuid
import utils
from .db import db
from flask import Blueprint, Response, current_app, make_response, request, send_file
from flask_login import login_required


file = Blueprint('file', __name__)

@file.route('/image/<imageName>', methods=['GET'])
@login_required
def get_image(imageName):
    root_path = os.getcwd()
    img_file = root_path+current_app.config['BACKEND_IMAGE_PATH']+f'/{imageName}'
    if os.path.isfile(img_file):
        return send_file(img_file)

@file.route('/<batchId>/<image>', methods=['GET'])
@login_required
def send_image_file(batchId, image):
  
    img_file = os.path.join(current_app.config['IMAGE_PATH'],f'{batchId}/{image}.jpg')
    root_path = os.getcwd()
    no_img =  root_path+current_app.config['BACKEND_IMAGE_PATH']+f'/no-preview.png'
    # print("###############",img_file)
    send_data_file = utils.get_images(img_file,no_img)
    return send_data_file

@file.route("/uploads", methods=["POST"])
@login_required
def upload_zip():

    try:
        zip_file = request.files['zip_file']
        zip_file_name = os.path.splitext(zip_file.filename)[0]

        if zip_file:
            extention = os.path.splitext(zip_file.filename)[1]

            if extention != current_app.config['ALLOWED_EXTENTIONS']:
                return Response(
                    response=json.dumps({"Message": "Not a .zip file"}),
                    status=200,
                    mimetype="application/json"
                )

            batch_id = uuid.uuid4()
            # print("***id****",batch_id)
            
            utils.extract_file(zip_file,db,batch_id,current_app.config['IMAGE_PATH'])
            utils.push_json_data_in_db(batch_id, db,current_app.config['IMAGE_PATH'])
            utils.remove_filesystem_folder(batch_id,current_app.config['IMAGE_PATH'])
            
        current_app.logger.info('Batch Uploaded')
        return Response(
            response=json.dumps({"Message": "File Uploaded Successfully"}),
            status=200,
            mimetype="application/json"
        )

    except Exception as ex:
        current_app.logger.exception('Batch upload failed : %s', ex)
        return Response(
            response=json.dumps({"Message": "File cannot be Uploaded "}),
            status=500,
            mimetype="application/json"
        )

@file.route('/downloads', methods=['POST'])
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
        
        current_app.logger.info('Batch downloaded')
        return resp
    except Exception as ex:
        current_app.logger.exception('Batch download failed : %s', ex)
        return Response(
            response=json.dumps({"Message": "File cannot be downloaded"}),
            status=500,
            mimetype="application/json"
        )