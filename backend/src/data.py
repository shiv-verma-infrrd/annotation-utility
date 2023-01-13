import json
import os
import shutil
from bson import ObjectId
from flask import Blueprint, Response, request, current_app
from flask_login import login_required
from .db import db
import utils

data = Blueprint('data', __name__)

@data.route('/test')
def index():
    return "This is an example app"

@data.route("/batches/<userId>", methods=["GET"])
@login_required
def get_batches(userId):
    
    try:
        data = list(db.batches.find())
        # data = list(db.batches.find({'allocatedTo': userId}))
        current_app.logger.info('Returning batch data')
        return Response(response=json.dumps(data, default=str),
                        status=200,
                        mimetype="application/json")

    except Exception as ex:
        current_app.logger.exception('Failed to read batches : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot read batches",
                }),
            status=500,
            mimetype="application/json"
        )

@data.route("/pages/<batchId>", methods=["GET"])
@login_required
def get_batch_documents_list(batchId):

    try:
        data = list(db.pages.find({"batchId": str(batchId)}, {'Data':0, 'correctedData':0}))
        current_app.logger.info('Returning document list in batch: batch %s', batchId)
        return Response(
            response=json.dumps(data,default=str),
            status=200,
            mimetype="application/json"
        )
    except Exception as ex:
        print(ex)


@data.route("/pages/<batchId>/<docId>", methods=["GET"])
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

        current_app.logger.info('Returning document data: document %s', docId)
        return Response(
            response=json.dumps(data,default=str),
            status=200,
            mimetype="application/json"
        )
    except Exception as ex:
        current_app.logger.exception('Failed to read document data : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot read documents",
                }),
            status=500,
            mimetype="application/json"
        )

@data.route("/pages", methods=["PUT"])
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
        current_app.logger.exception('Failed to update document data : %s', ex)
        return Response(
            response=json.dumps({"Message": "record not updated"}),
            status=500,
            mimetype="application/json"
        )

@data.route("/batch/<batchId>", methods=["DELETE"])
@login_required
def delete_batches(batchId):
    try:
        dbResponse = db.batches.delete_one({"batchId": str(batchId)})
        dbResponse2 = db.pages.delete_many({"batchId": str(batchId)})
        
        path = os.path.join(current_app.config['IMAGE_PATH'] ,f'{str(batchId)}')
        shutil.rmtree(path)
        current_app.logger.info('Batch Deleted : batch %s', )
        return Response(
            response=json.dumps({"Message": "Batch deleted", "id": f"{batchId}"}),
            status=200,
            mimetype="application/json"
        )
    except Exception as ex:
        current_app.logger.exception('Failed to delete batch : %s', ex)
        return Response(
            response=json.dumps({"Message": "File cannot be deleted"}),
            status=500,
            mimetype="application/json"
        )