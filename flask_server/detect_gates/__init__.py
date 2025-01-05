# auth/__init__.py
from flask import Blueprint

detect_gates_bp = Blueprint('detect_gates', __name__)

from . import routes
