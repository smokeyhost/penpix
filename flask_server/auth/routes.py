# auth/routes.py
from flask import request, session, jsonify, current_app, url_for
from auth import auth_bp
from model import User, db 
from flask_mailman import EmailMessage
from config import Config
import os

@auth_bp.route('/check-session',methods=["GET"])
def check_session():
    if 'user_id' in session:
        return "Session is active", 201
    else:
        return "Session has expired or doesn't exist", 401

@auth_bp.route("/login", methods=["POST"])
def login():
    email = request.json.get("email")
    password = request.json.get("password")
    remember = request.json.get("remember", False)
    
    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        if not user.email_verified:
            return jsonify({"error": "Email not verified. Please verify your email first."}), 403

        session['user_id'] = user.id
        if remember:
            session.permanent = True 
        return jsonify({"message": "User logged in successfully", "user": user.to_dict()})
    else:
        return jsonify({"error": "Unauthorized"}), 401

@auth_bp.route("/register", methods=["POST"])
def register():
    email = request.json.get("email")
    password = request.json.get("password")
    
    if not email.endswith('@usc.edu.ph'):
        return jsonify({"error": "Invalid email domain. Only @usc.edu.ph emails are allowed."}), 400
    
    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({"error": "User already exists"}), 400
    else:
        new_user = User(email=email)
        new_user.set_password(password)
        verification_token = new_user.generate_verification_token()  # Generate verification token
        db.session.add(new_user)
        db.session.commit()

        verification_link = f"http://localhost:5173/verify-email?token={verification_token}"
        
        msg = EmailMessage(
            "Email Verification",
            f"Please verify your email by clicking on the following link:{verification_link}",
            Config.MAIL_USERNAME, 
            [email]
        )
        msg.send()

        return jsonify({"message": "User registered successfully. Please verify your email."})


@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "User logged out successfully"})


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    email = request.json.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    user = User.query.filter_by(email=email).first()
    if user:
        token = user.generate_reset_token()
        reset_link = f"http://localhost:5173/reset-password?token={token}"
        
        msg = EmailMessage(
            "Password Recovery",
            f"To reset your password, visit the following link: {reset_link}",
            Config.MAIL_USERNAME, 
            [email]
        )
        msg.send()
        return jsonify({"message": "A password recovery link has been sent to your email address."})
    else:
        return jsonify({"error": "No account found with that email address."}), 404


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    token = request.json.get("token")
    new_password = request.json.get("new_password")

    if not token or not new_password:
        return jsonify({"error": "Token and new password are required"}), 400

    user = User.query.filter_by(reset_token=token).first()

    if user and user.verify_reset_token(token):
        user.set_password(new_password)
        user.reset_token = None  # Clear the reset token
        user.reset_token_expiry = None  # Clear the token expiry
        db.session.commit()
        return jsonify({"message": "Password has been reset successfully."})
    

@auth_bp.route("/change-password", methods=["POST"])
def change_password():
    new_password = request.json.get("newPassword")
    
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401

    user_id = session['user_id']
    user = User.query.get(user_id)
    
    if not new_password:
        return jsonify({"error": "Token and new password are required"}), 400

    if user:
        user.set_password(new_password)
        db.session.commit()
        return jsonify({"message": "Password has been reset successfully."}), 200
    
    return jsonify({"Error": "Password changed is unsuccessful. Try again later."})
    

@auth_bp.route("/update-user-info", methods=["PUT"])
def update_user_info():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401

    user_id = session['user_id']
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    name = request.json.get("name", user.name)
    contact_number = request.json.get("contactNumber", user.contact_number)
    recovery_email = request.json.get("recoveryEmail", user.recovery_email)
    
    user.name = name
    user.contact_number = contact_number
    user.recovery_email = recovery_email
    db.session.commit()
    return jsonify({"message": "User information updated successfully.", "user": user.to_dict()})


@auth_bp.route("/verify-reset-token", methods=["POST"])
def verify_reset_token():
    token = request.json.get("token")

    if not token:
        return jsonify({"error": "Token is required"}), 400

    user = User.query.filter_by(reset_token=token).first()

    if user and user.verify_reset_token(token):
        return jsonify({"message": "Token is valid"})
    else:
        return jsonify({"error": "Invalid or expired token"}), 400
    
@auth_bp.route("/verify-email", methods=["POST"])
def verify_email():
    token = request.json.get("token")

    if not token:
        return jsonify({"error": "Token is required"}), 400

    user = User.query.filter_by(verification_token=token).first()

    if user and user.verify_verification_token(token):
        user.email_verified = True
        user.verification_token = None  
        user.verification_token_expiry = None  
        db.session.commit()
        return jsonify({"message": "Email has been verified successfully."})
    
    return jsonify({"error": "Invalid or expired token."}), 400

@auth_bp.route("/validate-password", methods=["POST"])
def validate_password():
    email = request.json.get("email")
    password = request.json.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        return jsonify({"message": "Password is valid."}), 200
    else:
        return jsonify({"error": "Invalid email or password."}), 401
    
@auth_bp.route("/check-recovery-info", methods=["POST"])
def check_recovery_info():
    email = request.json.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "No account found with that email address."}), 404

    return jsonify({
        "recovery_email": user.recovery_email or "",
        "contact_number": user.contact_number or ""
    })


@auth_bp.route("/user/<string:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify({"user":user.to_dict()})
    else:
        return jsonify({"error": "User not found"}), 404

@auth_bp.route('/upload_profile_image', methods=['POST'])
def upload_profile_image():
    user_id = session['user_id']
    user = User.query.get(user_id)

    if user:
        uploads_dir = os.path.join(current_app.root_path, 'static', 'images', 'profiles')
        os.makedirs(uploads_dir, exist_ok=True)

        image_file = request.files['image']
        
        image_filename = f"{user_id}_profile_image.jpg" 
        image_file_path = os.path.join(uploads_dir, image_filename)
        image_file.save(image_file_path)


        image_url = url_for('static', filename=f'images/profiles/{image_filename}', _external=True)
        user.set_profile_image(image_url)
        db.session.commit()

        return jsonify({
            'message': 'Image uploaded successfully!',
            'user': user.to_dict()  
        }), 200

    return jsonify({'message': 'User not found!'}), 404
