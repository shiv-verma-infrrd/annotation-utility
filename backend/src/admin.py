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
        team_id = str(uuid.uuid4())
        new_user = {
                    "team_id": team_id,
                    "team_name" : data['team_name'] ,
                    "users": data['users'],
                    "batches":[]
                  }
        
        db.Teams.insert_one(new_user)
        teams = {
            "team_id": team_id,
            "team_name" : data['team_name']
        }
        
        for user in data['users']:
            db.Users.update_one({"user_id":user['user_id'] }, {"$set": { "team": [teams] }})
       
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
        
        
@admin.route("/create_team", methods=["PUT"])
@login_required
@admin_permission.require()
def update_team():
    try:
        # print(request.form['name'])
        data = request.json
        # print(data['users'])
        ex_data = list(db.Teams.find({"team_id":data['team_id']}))
        
        ex_users = ex_data[0]['users']
        
        # print("eeeeeeeeeeeeeeee",ex_data)
        # print("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq")
        for user in data['users']:
            ex_users.append(user)
            
        
        db.Teams.update_one({"team_id":data['team_id'] }, {"$set": { "users": ex_users }})
        
        # print("##########")
        # print(data)
        # print("###########33")
        for user in ex_users:
                
            db_user_data = list(db.Users.find({"user_id":user['user_id']}))
            db_user_team = db_user_data[0]['team']
            
            addteams = {
                
            "team_id": data['team_id'],
            "team_name" : data['team_name']
            
            }
        
            if data['team_id'] not in db_user_team:    
                db_user_team.append(addteams)
                
            db.Users.update_one({"user_id":user['user_id']}, {"$set": { "team": db_user_team }})
                
        
        return Response(
                    response=json.dumps(
                        {
                            "message": " added to team sucessfully",
                        }),
                    status=200,
                    mimetype="application/json"
                )
    except Exception as ex:
        current_app.logger.exception('Failed to add to the team : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot create Team",
                }),
            status=500,
            mimetype="application/json"
        )
        
@admin.route("/delete-team-members", methods=["PUT"])
@login_required
@admin_permission.require()
def delete_team_members():
    try:
        
        data = request.json
        db_team_data = list(db.Teams.find({'team_id':data['team_id']}))
        new_user_data = data['users']
        old_user_data = db_team_data[0]['users']
        for new in new_user_data:
            for old in old_user_data:
                if old not in new_user_data:
                    
                    db_user = list(db.Users.find({"user_id":old['user_id']}))
                    db_user_team = db_user[0]['team']
                    db_user_team2 = db_user[0]['team']
                    
                    for team in db_user_team[:]:
                        if team['team_id'] == data["team_id"]:
                             db_user_team2.remove(team)
                             
                    db.Users.update_one({"user_id":old['user_id']}, {"$set": { "team": db_user_team2 }})
            
        db.Teams.update_one({"team_id":data['team_id'] }, {"$set": { "users": data['users'] }})
        return Response(
                    response=json.dumps(
                        {
                            "message": "Team Updated sucessfully",
                        }),
                    status=200,
                    mimetype="application/json"
                )
    except Exception as ex:
        current_app.logger.exception('Failed to update the team : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot create Team",
                }),
            status=500,
            mimetype="application/json"
        )        
                
@admin.route("/teams", methods=["GET"])
@login_required
@admin_permission.require()
def get_team():
    try:
        # print(request.form['name'])
        data = list(db.Teams.find())
        return Response(response=json.dumps(data, default=str),
                        status=200,
                        mimetype="application/json")
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
         
@admin.route("/delete_teams/<id>", methods=["DELETE"])
@login_required
@admin_permission.require()
def delete_team(id):
    try:
        # print(request.form['name'])
        dbResponse = db.Teams.delete_one({"_id": ObjectId(id) })
        # print(dbResponse)
        return Response(
                    response=json.dumps(
                        {
                            "message": "Team deleted sucessfully",
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
           
           
@admin.route("/team/<id>", methods=["GET"])
@login_required
@admin_permission.require()
def get_one_team(id):
    try:
        # print(request.form['name'])
        data = list(db.Teams.find({'team_id':id}))
        return Response(response=json.dumps(data, default=str),
                        status=200,
                        mimetype="application/json")
    except Exception as ex:
        current_app.logger.exception('Failed to create team : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "cannot fetch team data",
                }),
            status=500,
            mimetype="application/json"
        )                           
        

@admin.route("/assign_batch", methods=["POST"])
@login_required
@admin_permission.require()
def assign_batch():
    try:
        data = request.json
        db_teams =  list(db.Teams.find({"team_id":data['team_id'] }))
       
        db_team_batchs = db_teams[0]['batches']
       
        for newbatches in data['batches']:
            if newbatches not in db_team_batchs:
                db_team_batchs.append(newbatches)
      
        db.Teams.update_one({"team_id":data['team_id'] }, {"$set": { "batches": db_team_batchs }})
       
        for batch in data['batches']:
            
            db_batches = list(db.batches.find({"batchId":batch['batchID'] }))
            allocatedToTeams = db_batches[0]['allocatedToTeams']
            new_team = {
                "team_id": data['team_id'],
                "team_name":data['team_name']
            }
            
            if new_team not in allocatedToTeams:
                allocatedToTeams.append(new_team)
            
            db.batches.update_one({"batchId":batch['batchID'] }, {"$set": { "allocatedToTeams": allocatedToTeams }})
             
            
        return Response(
            response=json.dumps(
                {
                    "message": " Batch assigned successfully",
                }),
            status=200,
            mimetype="application/json"
        )
    except Exception as ex:
        current_app.logger.exception('Failed to assign batch : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "Assignment of batch failed",
                }),
            status=500,
            mimetype="application/json"
        )

@admin.route("/assign-batchs-users", methods=["POST"])
@login_required
@admin_permission.require()
def assign_batch_users():
    try:
        data = request.json
        print(data)
        for batch in data['batches']:
            
            db_batches = list(db.batches.find({"batchId":batch['batchID'] }))
            allocatedToUsers = db_batches[0]['allocatedToUsers']
            new_user = {
                "user_id": data['user_id'],
                "user_name":data['user_name']
            }
            
            if new_user not in allocatedToUsers:
                allocatedToUsers.append(new_user)
            
            db.batches.update_one({"batchId":batch['batchID'] }, {"$set": { "allocatedToUsers": allocatedToUsers }})
             
            
        return Response(
            response=json.dumps(
                {
                    "message": " Batch assigned successfully",
                }),
            status=200,
            mimetype="application/json"
        )
    except Exception as ex:
        current_app.logger.exception('Failed to assign batch : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "Assignment of batch failed",
                }),
            status=500,
            mimetype="application/json"
        )        
        
@admin.route("/batches-data/<id>", methods=["GET"])
@login_required
@admin_permission.require()
def fetch_batch(id):
    try:
        
        data = list(db.batches.find({"batchId":id}))
          
        return Response(
            response=json.dumps(data,default=str),
            status=200,
            mimetype="application/json"
        )
    except Exception as ex:
        current_app.logger.exception('Failed to fetch batch : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "Failed to fetch batch",
                }),
            status=500,
            mimetype="application/json"
        )        
        
@admin.route("/delete-batch-user", methods=["PUT"])
@login_required
@admin_permission.require()
def update_batch_user():
    try:
        
        
        data = request.json
        
        db.batches.update_one({"batchId":data['batchId'] }, {"$set": { "allocatedToUsers": data["allocatedToUsers"] }})
          
        return Response(
            response=json.dumps(data,default=str),
            status=200,
            mimetype="application/json"
        )
    except Exception as ex:
        current_app.logger.exception('Failed to update users : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "Failed to update user",
                }),
            status=500,
            mimetype="application/json"
        ) 
        
@admin.route("/delete-batch-team", methods=["PUT"])
@login_required
@admin_permission.require()
def update_batch_team():
    try:
        
        
        data = request.json
        db_batches = list(db.batches.find({"batchId":data['batchId']}))
        db.batches.update_one({"batchId":data['batchId'] }, {"$set": { "allocatedToTeams": data["allocatedToTeams"] }})
        for old_team in db_batches[0]['allocatedToTeams']:
            if old_team not in data['allocatedToTeams']:
                 db_team = list(db.Teams.find({"team_id":old_team['team_id']}))
                 
                 db_team_batch = db_team[0]['batches']
                 for batch in db_team_batch[:]:
                     if batch['batchID'] == data['batchId']:
                         db_team_batch.remove(batch)
                 db.Teams.update_one({"team_id":old_team['team_id']},{"$set": { "batches": db_team_batch }})  
        
      
        return Response(
            response=json.dumps(data,default=str),
            status=200,
            mimetype="application/json"
        )
    except Exception as ex:
        current_app.logger.exception('Failed to update teams : %s', ex)
        return Response(
            response=json.dumps(
                {
                    "message": "Failed to update teams",
                }),
            status=500,
            mimetype="application/json"
        )                        