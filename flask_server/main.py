from flask import Flask, request, jsonify, make_response
from model import db
from auth import auth_bp
from task import task_bp
from files import files_bp
from detect_gates import detect_gates_bp
from notification import notification_bp
from contact import contact_bp
from classes import classes_bp
from config import Config
from flask_cors import CORS
from flask_mailman import Mail
from dotenv import load_dotenv
from flask_migrate import Migrate

load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
migrate = Migrate(app, db)

mail = Mail()
mail.init_app(app)

CORS(app, origins= ["https://uscpenpix.online", "https://api.uscpenpix.online"], supports_credentials=True)

@app.after_request
def apply_cors_headers(response):
    origin = request.headers.get('Origin')
    if origin in ["https://uscpenpix.online", "https://api.uscpenpix.online"]:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(task_bp, url_prefix='/task')
app.register_blueprint(files_bp, url_prefix='/files')
app.register_blueprint(detect_gates_bp, url_prefix='/detect-gates')
app.register_blueprint(notification_bp, url_prefix='/notification')
app.register_blueprint(contact_bp, url_prefix='/contact')
app.register_blueprint(classes_bp, url_prefix='/classes')

@app.route("/health", methods=["GET"])
def health_check():
    return {"status": "ok"}, 200

if __name__ == "__main__":
    with app.app_context():
        # db.drop_all()
        db.create_all()
        # Migrate(app, db)
    # for development
    #app.run(debug=True, port=5001)
    app.run(debug=True)

