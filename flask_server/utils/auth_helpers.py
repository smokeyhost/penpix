from functools import wraps
from flask import session, jsonify, current_app, request
import jwt
import datetime

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "Unauthorized access. Please log in."}), 403
        return f(*args, **kwargs)
    return decorated_function

# def login_required(f):
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         token = request.headers.get('Authorization')
#         if not token:
#             return jsonify({"error": "Token is missing"}), 401

#         user_id = verify_jwt(token)
#         if not user_id:
#             return jsonify({"error": "Invalid or expired token"}), 401

#         request.user_id = user_id
#         return f(*args, **kwargs)
#     return decorated_function
    

def generate_jwt(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    
    token  = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
    return token

def verify_jwt(token):
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None