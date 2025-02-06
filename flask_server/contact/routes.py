from flask import request, jsonify
from flask_mailman import EmailMessage
from config import Config
from contact import contact_bp

@contact_bp.route("/send-message", methods=["POST"])
def send_user_details():
    """Handles user contact form submission and sends an email."""
    
    # Extract request data
    data = request.get_json()
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    email = data.get("email")
    message = data.get("message")
    
    # Validate required fields
    if not all([first_name, last_name, email, message]):
        return jsonify({"error": "First name, last name, email, and message are required"}), 400

    # Construct the email message
    subject = "PenPix Inquiry from User"
    body = (
        f"Here are the details of the user:\n"
        f"Full Name: {first_name} {last_name}\n"
        f"Email: {email}\n\n"
        f"Message:\n{message}"
    )
    
    msg = EmailMessage(
        subject=subject,
        body=body,
        from_email=Config.MAIL_DEFAULT_SENDER,
        to=["markcernal21@gmail.com"]
    )

    # Attempt to send the email
    try:
        msg.send()
        return jsonify({"message": "The message has been sent successfully."}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500
