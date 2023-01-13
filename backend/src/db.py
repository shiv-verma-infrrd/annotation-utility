import logging
import pymongo
from .config import Config

try:
    mongo = pymongo.MongoClient(
        host=Config.HOST,
        port=Config.PORT,
        serverSelectionTimeoutMS=100
    )

    db = mongo[Config.DB_NAME]
    users = db.Users
    mongo.server_info()
    # logging.info('Connected to the database successfully')

except Exception as ex:
    pass
    # app.logger.warning('Cannot connect to database: %s', ex)