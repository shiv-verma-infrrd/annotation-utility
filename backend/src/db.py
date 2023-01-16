import logging
import pymongo
from config import ProductionConfig, DevelopmentConfig, TestingConfig
try:
    mongo = pymongo.MongoClient(
        host=DevelopmentConfig.HOST,
        port=DevelopmentConfig.PORT,
        serverSelectionTimeoutMS=100
    )

    db = mongo[DevelopmentConfig.DB_NAME]
    users = db.Users
    mongo.server_info()
    # logging.info('Connected to the database successfully')

except Exception as ex:
    pass
    # app.logger.warning('Cannot connect to database: %s', ex)