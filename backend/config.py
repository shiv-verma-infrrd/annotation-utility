class Config(object):
    DEBUG = False
    TESTING = False

    DB_NAME = "CorrectionUIdb2"
    HOST = "mongodb+srv://admin:1234@cluster0.p6bfznx.mongodb.net/test"
    ZIP_FILE_UPLOAD_DIRECTORY = 'uploads/'
    ZIP_FILE_EXTRACT_DIRECTORY = 'assets/'
    ALLOWED_EXTENTIONS = '.zip' 
    FILE_JSON_DIRECTORY = r"assets\annotations"
    
class ProductionConfig(Config):
    pass

class DevelopmentConfig(Config):
     DEBUG = True
     DB_NAME = "CorrectionUIdb2"
     ZIP_FILE_UPLOAD_DIRECTORY = 'uploads/'
     ZIP_FILE_EXTRACT_DIRECTORY = 'assets/'
     ALLOWED_EXTENTIONS = '.zip' 
     FILE_JSON_DIRECTORY = r"assets\annotations"
      

class TestingConfig(Config):
     TESTING = True
     DB_NAME = "CorrectionUIdb2"
     ZIP_FILE_UPLOAD_DIRECTORY = 'uploads/'
     ZIP_FILE_EXTRACT_DIRECTORY = 'assets/'
     ALLOWED_EXTENTIONS = '.zip' 
     FILE_JSON_DIRECTORY = r"assets\annotations"
         
