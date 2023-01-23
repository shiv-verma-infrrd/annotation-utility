import logging
from flask import Flask, render_template
from flask_cors import CORS
from flask_login import LoginManager
import pymongo
from .db import users
from .data import data
from . import models
import utils
from .auth import user_blueprint
from .file import file
from .admin import admin
from flask_principal import Principal, RoleNeed, Identity
from flask_swagger_ui import get_swaggerui_blueprint


app = Flask(__name__)
app.config['ENV'] = "development"

if app.config['ENV'] == "production":
    app.config.from_object("config.ProductionConfig")
elif app.config['ENV'] == 'testing':
    app.config.from_object("config.TestingConfig")
else:
    app.config.from_object("config.DevelopmentConfig")

cors = CORS(
    app,
    resources={r"*": {"origins":app.config['ALLOWED_URL'] }},
    supports_credentials=True,
)

app.register_blueprint(data)
app.register_blueprint(file)
app.register_blueprint(admin)
app.register_blueprint(user_blueprint)

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

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.session_protection = "strong"

principals = Principal()

@login_manager.user_loader
def user_loader(id):
    user = utils.get_user(id, users)
    if user:
        user_model = models.User()
        user_model.id = user["_id"]
        
        # Identify and set user role
        role = user['role']
        identity = Identity(user["_id"])
        identity.provides.add(RoleNeed(role))
        principals.set_identity(identity=identity)

        return user_model
    return None

@app.route("/")
@app.route("/static/batches")
@app.route("/static/login")
@app.route("/static/documents")
@app.route("/static/editing-page")
@app.route("/static/admin")
@app.route("/static/admin/batches")
@app.route("/static/admin/users")
@app.route("/static/admin/create_user")
def root():
    return render_template('index.html')