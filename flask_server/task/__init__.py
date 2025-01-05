# task/__init__.py
from flask import Blueprint

task_bp = Blueprint('task', __name__)

from . import routes
