from src import app
import logging

logging.basicConfig(filename='record.log', level=logging.DEBUG, format=f'%(asctime)s %(levelname)s %(name)s : %(message)s')

if __name__ == "__main__":
    app.run(debug=True, port=8008)