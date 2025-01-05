from contact import contact_bp
from flask import request,jsonify 
from flask_mailman import EmailMessage
from config import Config

@contact_bp.route("/send-message", methods=["POST"])
def send_user_details():
    first_name = request.json.get("firstName")
    last_name = request.json.get("lastName")
    email = request.json.get("email")
    message = request.json.get("message")
    
    if not first_name or not last_name or not email or not message:
        return jsonify({"error": "First name, last name, and email are required"}), 400

    msg = EmailMessage(
        "User Information",
        f"Here are the details of the user:\n\Full Name: {first_name} {last_name}\nEmail: {email}\n\n Message:\n {message}", Config.MAIL_USERNAME, ["markcernal21@gmail.com"]
    )

    try:
        msg.send()
        return jsonify({"message": "User details have been sent successfully."}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500