# auth/__init__.py
from flask import Blueprint

classes_bp = Blueprint('classes', __name__)

from . import routes
