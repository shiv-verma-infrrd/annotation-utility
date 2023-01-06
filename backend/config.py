import os
class Config(object):
    
   
    
    IMAGE_PATH = os.environ.get("BATCH_IMAGES_PATH")
    # print("image :", IMAGE_PATH)
    ENV = "development"
    DEBUG = False
    TESTING = False
    
    DB_NAME = "CorrectionUIdb2"
    HOST = "mongodb+srv://admin:1234@cluster0.p6bfznx.mongodb.net/test"
    DEBUG=True
    SECRET_KEY="secret"
    SESSION_COOKIE_HTTPONLY=True
    REMEMBER_COOKIE_HTTPONLY=True
    SESSION_COOKIE_SECURE=True
    SESSION_COOKIE_SAMESITE="None"
    ALLOWED_EXTENTIONS = ".zip"
    
class ProductionConfig(Config):
    pass

class DevelopmentConfig(Config):
     DEBUG = True
     DB_NAME = "CorrectionUIdb2"
     ENV = 'development'
  
class TestingConfig(Config):
     TESTING = True
     DB_NAME = "CorrectionUI_Testing"
     
         

