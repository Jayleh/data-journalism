from flask import Flask


app = Flask(__name__)


from risk import routes
