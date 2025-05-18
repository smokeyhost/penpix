# tasks_endpoint.py
from flask import request, jsonify, session, send_file
from model import db, Task, Classes, Notification
from task import task_bp
from utils.auth_helpers import login_required
from sys_main_modules.qr_code.qr_code import append_qr_code_to_template
from flask_cors import cross_origin

from datetime import datetime
import shutil
import os
import pytz
import stat

@login_required
@task_bp.route('/create-task', methods=['POST'])
def create_task():
    user_id = session.get('user_id')  
    if not user_id:
        return jsonify({"error": "User not logged in"}), 401

    data = request.json

    # if not all(key in data for key in ['title', 'classId', 'dueDate', 'examType', 'answerKeys', 'data', 'status', 'totalSubmissions','reviewedSubmission']):
    #     return jsonify({"error": "Missing required fields"}), 400

    try:
        due_date = datetime.datetime.fromisoformat(data['dueDate'])
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid date format"}), 400

    task = Task(
        title=data['title'],
        user_id=user_id,
        class_id=data['classId'],
        total_submissions=data['totalSubmissions'],  
        reviewed_submissions=data['reviewedSubmissions'], 
        due_date=due_date,
        status=data.get('status', 'Ongoing'),  
        exam_type=data['examType'],
        answer_keys=data['answerKeys'],
    )

    db.session.add(task)
    
    class_obj = Classes.query.get(data['classId'])
    if class_obj:
        class_obj.tasks.append(task) 

    db.session.commit()

    return jsonify(task.to_dict()), 201

import datetime

@login_required
@task_bp.route('/get-tasks', methods=['GET'])
@cross_origin()
def list_tasks():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "User not logged in"}), 401

    tasks = Task.query.filter_by(user_id=user_id).all()
    current_time = datetime.datetime.utcnow()

    overdue_tasks = Task.query.filter(
        Task.user_id == user_id,
        Task.due_date < current_time,
        ~Task.notifications.any(Notification.type == 'due_date')
    ).all()

    notifications = []
    for task in overdue_tasks:
        title = "Task Due Date Passed"
        notification_message = f"The due date for task '{task.title}' (ID: {task.id}) has passed."
        notification_type = "due_date"
        notification = Notification(
            title=title,
            message=notification_message,
            type=notification_type,
            is_read=False,
            user_id=task.user_id,
            task_id=task.id
        )
        db.session.add(notification)
        notifications.append(notification)

    if notifications:
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Database commit error: {str(e)}"}), 500
    return jsonify([task.to_dict() for task in tasks])

@login_required
@task_bp.route('/get-task/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    return jsonify(task.to_dict())  

@task_bp.route('/get-tasks-by-class/<int:class_id>', methods=['GET'])
def get_tasks_by_class(class_id):
    tasks = Task.query.filter_by(class_id=class_id).all()
    return jsonify({"tasks": [task.to_dict() for task in tasks]})

@login_required
@task_bp.route('/edit-task/<int:task_id>', methods=['PATCH'])
def edit_task(task_id):
    try:
        print("here")
        task = Task.query.get(task_id)
        if not task:
            return jsonify({"message": "Task not found"}), 404

        task_data = request.json
        print(task_data)
        try:
            due_date = datetime.datetime.fromisoformat(task_data['dueDate'])
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid date format"}), 400

        task.title = task_data.get('title', task.title)
        task.exam_type = task_data.get('examType', task.exam_type)
        task.status = task_data.get('status', task.status)
        task.answer_keys = task_data.get('answerKeys', task.answer_keys)
        task.class_id = task_data.get('classId', task.class_id)
        task.due_date = due_date
        
        db.session.commit()

        return jsonify({"message": "Task updated successfully", "task_id": task_id})

    except Exception as e:
        print(f"An error occurred: {e}")  # Log the error
        return jsonify({"message": "An error occurred while updating the task"}), 500

def remove_readonly(func, path, excinfo):
    os.chmod(path, stat.S_IWRITE)
    func(path)

@login_required
@task_bp.route('/delete-task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({"message": "Task not found"}), 404

        TASK_FOLDER = os.path.join('static', 'images', str(task_id))
        if os.path.exists(TASK_FOLDER):
            shutil.rmtree(TASK_FOLDER, onerror=remove_readonly)
        db.session.delete(task)
        db.session.commit()

        return jsonify({"message": "Task deleted", "task_id": task_id})
    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
    
@login_required
@task_bp.route('/delete-expression/<int:task_id>', methods=['POST'])
def delete_expression(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404
    
    expression_id = request.json.get('expression_id')
    if expression_id is None:
        return jsonify({"message": "Expression ID is required"}), 400

    try:
        expression_id = int(expression_id)
        if expression_id < 0 or expression_id >= len(task.answer_keys):
            return jsonify({"message": "Invalid expression ID"}), 400
        
        new_answer_keys = task.answer_keys.copy()
        new_answer_keys.pop(expression_id)
        task.answer_keys = new_answer_keys
        db.session.commit()
        return jsonify({"message": "Answer key deleted successfully", "answer_keys": task.answer_keys}), 200
    
    except (ValueError, IndexError):
        return jsonify({"message": "Invalid expression ID"}), 400
    
    
@login_required
@task_bp.route('/get-template/<int:task_id>', methods=['GET'])
def get_template(task_id):
    task = Task.query.get(task_id)
    template_path = './template.png'
    position = (200, 80)  

    # data = {
    #     'task_id': task.id,
    #     'class_id': task.class_id,
    #     # 'task_title': task.title,
    # }
    
    data = f"{task.id}|{task.class_id}"
    TASK_FOLDER = os.path.join('static', 'images', str(task_id), 'grid_template')

    if not os.path.exists(TASK_FOLDER):
        os.makedirs(TASK_FOLDER)
        
    filepath = append_qr_code_to_template(data, size=220, template_path=template_path, output_path=TASK_FOLDER, position=position)
    print(filepath)
    
    # file_url = url_for('static', filename=os.path.join('images', str(task_id), 'grid_template', os.path.basename(filepath)).replace('\\', '/'), _external=True)
    # print(file_url)

    return send_file(filepath, as_attachment=True, download_name=os.path.basename(filepath))
