from flask import Flask
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

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True) 

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(task_bp, url_prefix='/task')
app.register_blueprint(files_bp, url_prefix='/files')
app.register_blueprint(detect_gates_bp, url_prefix='/detect-gates')
app.register_blueprint(notification_bp, url_prefix='/notification')
app.register_blueprint(contact_bp, url_prefix='/contact')
app.register_blueprint(classes_bp, url_prefix='/classes')


if __name__ == "__main__":
    with app.app_context():
        # db.drop_all()
        db.create_all()
        # Migrate(app, db)
    # for development
    app.run(debug=True, port=5001)
    # app.run()
# 