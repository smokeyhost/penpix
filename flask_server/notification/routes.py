from flask import jsonify, session, request
from model import db, Notification
from notification import notification_bp
from utils.auth_helpers import login_required

@login_required
@notification_bp.route('/mark-as-read/<int:notification_id>', methods=['PATCH'])
def mark_as_read(notification_id):
    notification = Notification.query.get(notification_id)

    if not notification:
        return jsonify({"message": "Notification not found"}), 404

    notification.is_read = True
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error marking notification as read: {str(e)}"}), 500

    return jsonify({"message": "Notification marked as read successfully", "notification": notification.to_dict()})

@login_required
@notification_bp.route('/mark-as-unread/<int:notification_id>', methods=['PATCH'])
def mark_as_unread(notification_id):
    notification = Notification.query.get(notification_id)

    if not notification:
        return jsonify({"message": "Notification not found"}), 404

    notification.is_read = False
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error marking notification as unread: {str(e)}"}), 500

    return jsonify({"message": "Notification marked as unread successfully", "notification": notification.to_dict()})

@login_required
@notification_bp.route('/get-read-notifications', methods=['GET'])
def get_read_notifications():
    user_id = session['user_id']

    if not user_id:
        return jsonify({"message": "User ID is missing"}), 400

    notifications = Notification.query.filter_by(user_id=user_id, is_read=True).all()

    if not notifications:
        return jsonify({"notifications": []})

    notifications_data = [notification.to_dict() for notification in notifications]
    return jsonify({"notifications": notifications_data})

@login_required
@notification_bp.route('/get-unread-notifications', methods=['GET'])
def get_unread_notifications():
    user_id = session.get('user_id')
    filters = request.args.get('filters', 'new_submission').split(',')

    if not user_id:
        return jsonify({"message": "User ID is missing"}), 400

    if not filters:
        filters = ['new_submission']  

    notifications = Notification.query.filter(
        Notification.user_id == user_id,
        Notification.is_read == False,
        Notification.type.in_(filters)
    ).all()

    if not notifications:
        return jsonify({"notifications": []})

    notifications_data = [notification.to_dict() for notification in notifications]
    return jsonify({"notifications": notifications_data})