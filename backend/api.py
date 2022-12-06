from flask import Flask, request, jsonify, Response, json
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
database = client["CorrectionUI"]
user = database["Users"]

app = Flask(__name__)
jwt = JWTManager(app)

app.config["JWT_SECRET_KEY"] = "key"

@app.route("/api/register", methods=["POST"])
def register():
    email = request.form["email"]
    test = user.find_one({"email": email})
    if test:
        return jsonify(message="User Already Exist"), 409
    else:
        name = request.form["name"]
        password = request.form["password"]
        user_info = dict(name=name, email=email, password=password)
        user.insert_one(user_info)
        return jsonify(message="User added sucessfully"), 201

@app.route("/api/login", methods=["POST"])
def login():
    if request.is_json:
        email = request.json["email"]
        password = request.json["password"]
    else:
        email = request.form["email"]
        password = request.form["password"]

    test = user.find_one({"email": email,"password":password})
    if test:
        access_token = create_access_token(identity=email)
        return jsonify(message="Login Succeeded!", access_token=access_token), 201
    else:
        return jsonify(message="Bad Email or Password"), 401

class MongoAPI:
    def __init__(self, collection):
        self.client = MongoClient("mongodb://localhost:27017/")
        database = 'CorrectionUI'
        cursor = self.client[database]
        self.collection = cursor[collection]
        
    def read(self):
        documents = self.collection.find()
        output = [{item: data[item] for item in data} for data in documents]
        return output

@app.route('/api/batches', methods=['GET'])
@jwt_required()
def batches_read():
    obj1 = MongoAPI('Batches')
    response = {"batchList": obj1.read()}
    return Response(response=json.dumps(response, default=str),
                    status=200,
                    mimetype='application/json')


if __name__ == '__main__':
    app.run(host="localhost", debug=True)