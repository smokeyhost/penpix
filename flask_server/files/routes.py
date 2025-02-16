from werkzeug.utils import secure_filename
import os
from files import files_bp
from utils.auth_helpers import login_required
from model import db, UploadedFile, Task, CircuitAnalysis, Notification, Classes
from flask import jsonify, request, send_from_directory
from sys_main_modules.qr_code.qr_code import determine_proper_orientation, extract_qr_code_data
from PIL import Image
import fitz

@files_bp.route('/<int:task_id>/<filename>')
def serve_file(task_id, filename):
    TASK_FOLDER = os.path.join('static', 'images', str(task_id))
    return send_from_directory(TASK_FOLDER, filename)
    
    
# @login_required
@files_bp.route('/upload-files', methods=['POST'])
def upload_files():
    if 'files' not in request.files:
        return jsonify({"message": "No files part"}), 400

    files = request.files.getlist('files')
    task_id = request.form.get('task_id')
    item_number = request.form.get('item_number')  # Expect item_number from the client
    
    if not task_id or not item_number:
        return jsonify({"message": "Task ID or Item Number is missing"}), 400

    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404

    class_id = task.class_id
    class_ = Classes.query.get(class_id)
    
    student_list = [student.strip().lower() for student in class_.student_list]  # Normalize student list
    uploaded_files = []
    invalid_files_not_enrolled = []
    invalid_files_not_belonging = []
    
    TASK_FOLDER = os.path.join('static', 'images', str(task_id))

    if not os.path.exists(TASK_FOLDER):
        os.makedirs(TASK_FOLDER)

    for file in files:
        if file.filename == '':
            return jsonify({"message": "Empty filename"}), 400

        filename = secure_filename(file.filename)
        filename_, _ = os.path.splitext(filename)
        student_id = filename_.split('_')[0].strip().lower()  
        print(f"Extracted student_id: {student_id}, Student list: {student_list}")

        if student_id not in student_list:
            invalid_files_not_enrolled.append(filename)
            continue
        
        file_ext = os.path.splitext(filename)[1].lower()
        try:
            if file_ext == '.pdf':
                # Convert the first page of the PDF to an image using PyMuPDF
                pdf_document = fitz.open(stream=file.read(), filetype="pdf")
                page = pdf_document.load_page(0)  # Load the first page
                pix = page.get_pixmap()
                image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

                corrected_image, qr_data = determine_proper_orientation(image)
                if qr_data is None:
                    raise ValueError("No QR Code found in the file or Invalid.")

                qr_task_id, qr_class_id = qr_data.split('|')
                if str(qr_task_id) != str(task_id) or str(qr_class_id) != str(class_id):
                    raise ValueError("The submitted file does not belong to the task")

                image_filename = f"{os.path.splitext(filename)[0]}.png"
                image_path = os.path.join(TASK_FOLDER, image_filename)
                corrected_image.save(image_path)
                uploaded_files.append(image_filename)
                stored_filename = image_filename
                
            else:
                image = Image.open(file)
                corrected_image, qr_data = determine_proper_orientation(image)
                if qr_data is None:
                    raise ValueError("No QR Code found in the file or Invalid.")
                
                qr_task_id, qr_class_id = qr_data.split('|') 

                if str(qr_task_id) != str(task_id) or str(qr_class_id) != str(class_id):
                    raise ValueError("The submitted file does not belong to the task")
                
                # Save the corrected image
                filepath = os.path.join(TASK_FOLDER, filename)
                corrected_image.save(filepath)
                uploaded_files.append(filename)
                stored_filename = filename
                
        except ValueError as e:
            invalid_files_not_belonging.append(stored_filename)
            continue
        except Exception as e:
            invalid_files_not_enrolled.append(stored_filename)
            continue
        
        existing_file = UploadedFile.query.filter_by(
            filename=stored_filename, task_id=task_id
        ).first()
        
        if existing_file:
            existing_file.filepath = os.path.join('images', str(task_id), stored_filename)
            existing_file.mimetype = file.mimetype
            existing_file.item_number = int(item_number)
            existing_file.graded = False  
            existing_file.total_grade = None  

            existing_analysis = CircuitAnalysis.query.filter_by(uploaded_file_id=existing_file.id).first()
            if existing_analysis:
                existing_analysis.threshold_value = 128
                existing_analysis.predictions = []
                existing_analysis.boolean_expressions = []
                existing_analysis.netlist = {}
                existing_analysis.truth_table = []
                existing_analysis.verilog_url_file = ''
            else:
                new_circuit_analysis = CircuitAnalysis(
                    threshold_value=128,
                    predictions=[],
                    boolean_expressions=[],
                    netlist={},
                    truth_table=[],
                    verilog_url_file='',
                    uploaded_file_id=existing_file.id
                )
                db.session.add(new_circuit_analysis)

        else:
            new_file = UploadedFile(
                filename=stored_filename,
                filepath=os.path.join('images', str(task_id), stored_filename),
                mimetype=file.mimetype,
                task_id=task_id,
                item_number=int(item_number),
                graded=False, 
                total_grade=None 
            )
            db.session.add(new_file)
            db.session.commit()

            new_circuit_analysis = CircuitAnalysis(
                threshold_value=128,
                predictions=[],
                boolean_expressions=[],
                netlist={},
                truth_table=[],
                verilog_url_file='',
                uploaded_file_id=new_file.id
            )
            db.session.add(new_circuit_analysis)

        uploaded_files.append({
            "filename": stored_filename,
            "replaced": bool(existing_file),
        })
        
        # Create Notification
        title = "File Uploaded"
        notification_message = f"File '{filename}' uploaded successfully for task {task.title}, item {item_number}."
        notification_type = "new_submission"
        notification = Notification(title=title, message=notification_message, type=notification_type, is_read=False,  user_id=task.user_id, task_id=task_id)
        db.session.add(notification)
    
    total_submissions = len(task.attached_files)
    task.total_submissions = total_submissions
    
    if task.reviewed_submissions < task.total_submissions:
        task.status = "Ongoing"
        
    db.session.add(task)

    expected_total_submissions = len(student_list) * len(task.answer_keys)
    if total_submissions == expected_total_submissions:
        title = "All Submissions Completed"
        notification_message = f"All students have submitted their files for task {task_id}."
        notification_type = "completed_submission"
        notification = Notification(title=title, message=notification_message, type=notification_type, is_read=False, user_id=task.user_id, task_id=task_id)
        db.session.add(notification)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Database commit error (during circuit analysis save): {str(e)}"}), 500

    response = {
        "message": "File upload results",
        "files_uploaded": uploaded_files,
        "invalid_files_not_enrolled": invalid_files_not_enrolled,
        "invalid_files_not_belonging": invalid_files_not_belonging,
    }
    
    return jsonify(response), 200

@login_required
@files_bp.route('/get-files/<int:task_id>', methods=['GET'])
def get_files(task_id):
    task = Task.query.get(task_id)

    if not task:
        return jsonify({"message": "Task not found"}), 404

    files = UploadedFile.query.filter_by(task_id=task_id).all()
    files_data = [file.to_dict() for file in files]

    return jsonify({"files": files_data})


@login_required
@files_bp.route('/delete-file/<int:file_id>', methods=['DELETE'])
def delete_file(file_id):
    file = UploadedFile.query.get(file_id)

    if not file:
        return jsonify({"message": "File not found"}), 404

    task = Task.query.get(file.task_id)
    if not task:
        return jsonify({"message": "Associated task not found"}), 404
    
    reviewed_count = UploadedFile.query.filter_by(task_id=file.task_id, graded=True).count()
    task.reviewed_submissions = reviewed_count
    
    if task.reviewed_submissions == task.total_submissions:
        task.status = "Completed"
    elif task.reviewed_submissions < task.total_submissions:
        task.status = "Ongoing"
        
    try:
        os.remove(os.path.join('static', file.filepath))
        db.session.delete(file)
        
        task.total_submissions = len(task.attached_files)
        db.session.add(task)
        
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error deleting file: {str(e)}"}), 500

    return jsonify({"message": "File deleted successfully"})


@login_required
@files_bp.route('/update-grade/<int:file_id>', methods=['PUT'])
def update_total_grade(file_id):
    file = UploadedFile.query.get(file_id)
    
    if not file:
        return jsonify({"message": "File not found"}), 404
    
    data = request.get_json()
    total_grade = data.get('total_grade')

    if total_grade is None:
        return jsonify({"message": "Total grade is required"}), 400
    
    if not isinstance(total_grade, int) or total_grade < 0:
        return jsonify({"message": "Invalid grade value. It should be a non-negative integer."}), 400
    
    file.total_grade = total_grade
    file.graded = True  

    task = Task.query.get(file.task_id)
    if not task:
        return jsonify({"message": "Associated task not found"}), 404

    reviewed_count = UploadedFile.query.filter_by(task_id=file.task_id, graded=True).count()
    task.reviewed_submissions = reviewed_count

    if task.reviewed_submissions == task.total_submissions:
        task.status = "Completed"
    elif task.reviewed_submissions < task.total_submissions:
        task.status = "Ongoing"
        
    try:
        db.session.commit()
        return jsonify({
            "message": "Grade updated successfully",
            "total_grade": file.total_grade,
            "graded": file.graded,
            "task_reviewed_submissions": task.reviewed_submissions
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error updating grade: {str(e)}"}), 500


