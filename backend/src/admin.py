import json
import uuid
from datetime import date
from bson import ObjectId
from .db import db
from flask import Blueprint, Response, current_app, request
from flask_login import login_required
from flask_principal import Permission, RoleNeed

admin = Blueprint('admin', __name__)
admin_permission = Permission(RoleNeed('admin'))

@admin.route("/users", methods=["GET"])
@login_required
@admin_permission.require()
def get_users():
    try:
        data = list(db.Users.find())
        return Response(response=json.dumps(data, default=str),
                        status=200,
                        mimetype="application/json")

    except Exception as ex:
        current_app.logger.exception('Failed to return users list : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot read users",
                }),
            status=500,
            mimetype="application/json"
        )

@admin.route("/create_user", methods=["POST"])
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
        current_app.logger.exception('New user creation failed : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot create new user",
                }),
            status=500,
            mimetype="application/json"
        )   
        
@admin.route("/delete_user/<id>",methods=["DELETE"])
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
        current_app.logger.exception('Failed to delete user : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot delete new user",
                }),
            status=500,
            mimetype="application/json"
        ) 
        
@admin.route("/create_team", methods=["POST"])
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
        current_app.logger.exception('Failed to create team : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot create Team",
                }),
            status=500,
            mimetype="application/json"
        )

# @admin.route("/assign_batch", methods=["POST"])
# @login_required
# @admin_permission.require()
# def assign_batch():
#     try:
#         data = request.json
#         update = {
#             "allocatedBy": "admin",
#             "allocatedOn": date.today().strftime("%d/%m/%Y")
#         }
#         if data['assignedToUser']:
#             update["allocatedToUser"] = data['assignedToUser']
#         elif data['assignedToTeam']:
#             update["allocatedToTeam"] = data['assignedToTeam']
#         else:
#             current_app.logger.exception('Invalid batch assignment parameters : %s', ex)
#             return Response(
#                 response=json.dumps(
#                     {
#                         "message": "Passed invalid parameters",
#                     }),
#                 status=400,
#                 mimetype="application/json"
#             )
#         for batch_id in data['batches']:
#             db.batches.update_one({"_id": ObjectId(batch_id)}, {"$set": update})
            
#         return Response(
#             response=json.dumps(
#                 {
#                     "message": " Batch assigned successfully",
#                 }),
#             status=200,
#             mimetype="application/json"
#         )
#     except Exception as ex:
#         current_app.logger.exception('Failed to assign batch : %s', ex)
#         return Response(
#             response=json.dumps(
#                 {
#                     "message": "Assignment of batch failed",
#                 }),
#             status=500,
#             mimetype="application/json"
#         )