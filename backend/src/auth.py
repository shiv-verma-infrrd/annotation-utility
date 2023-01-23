from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, login_user, logout_user
from .models import User
from .db import db, users

user_blueprint = Blueprint('user_blueprint', __name__)

@user_blueprint.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        current_app.logger.info('Input credentials: %s', data)

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
            current_app.logger.info('Authentication Successful: Logging in user')
            return return_data, 200
    except Exception as ex:
        current_app.logger.info('Authentication Failed: %s', ex)
        return jsonify({"login": False})

@user_blueprint.route("/logout", methods=["GET"])
@login_required
def logout():
    logout_user()
    current_app.logger.info('Logging out user')
    return jsonify({"logout": True})