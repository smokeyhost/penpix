from flask import request, jsonify, send_file
from utils.auth_helpers import login_required
from detect_gates import detect_gates_bp
from model import db, UploadedFile, CircuitAnalysis, PredictionResult

from sys_main_modules.contour_tracing.threshold_image import apply_threshold_to_image
from sys_main_modules.contour_tracing.binary_image import binarize_image
from sys_main_modules.contour_tracing.mask_image import mask_image
from sys_main_modules.contour_tracing.netlist import process_circuit_connection, get_class_count
from sys_main_modules.contour_tracing.boolean_function import convert_to_sympy_expression, evaluate_boolean_expression, generate_truth_table, string_to_sympy_expression, count_inputs, is_expression_valid
from sys_main_modules.contour_tracing.export_netlist import export_to_verilog, generate_ltspice_netlist
from sys_main_modules.model_inference import infer_image
from sys_main_modules.filter_json import filter_detections
from sys_main_modules.contour_tracing.crop_image import crop_largest_border

from sympy import SympifyError

import os
import io
import json

@login_required
@detect_gates_bp.route('/set-filter-threshold', methods=['POST'])
def set_filter_threshold():
    threshold_value = request.json.get('thresholdValue')
    mode = request.json.get('mode')
    file_id = request.json.get('fileId')
    uploaded_file = UploadedFile.query.get(file_id)

    task_id = uploaded_file.task_id 
    def update_or_create_analysis(file, threshold_value):
        circuit_analysis = CircuitAnalysis.query.filter_by(uploaded_file_id=file.id).first()
        if not circuit_analysis:
            circuit_analysis = CircuitAnalysis(
                threshold_value=threshold_value,
                predictions=[],
                boolean_expressions=[],
                netlist={},
                verilog_url_file='',
                uploaded_file_id=file.id
            )
            db.session.add(circuit_analysis)
        else:
            circuit_analysis.threshold_value = threshold_value
        return circuit_analysis

    try:
        if mode == 'single':
            source_file = os.path.join('static', uploaded_file.filepath)
            img_io = apply_threshold_to_image(source_file, threshold_value=threshold_value)
            if img_io is None:
                return jsonify({"error": "Failed to process image"}), 500
            
            update_or_create_analysis(uploaded_file, threshold_value)
            db.session.commit()

            return send_file(img_io, mimetype='image/png', as_attachment=False)

        elif mode == 'multiple':
            uploaded_files = UploadedFile.query.filter_by(task_id=task_id).all()

            for file in uploaded_files:
                source_file = os.path.join('static', file.filepath)
                img_io = apply_threshold_to_image(source_file, threshold_value=threshold_value)
                
                if img_io is not None:
                    update_or_create_analysis(file, threshold_value)
                else:
                    return jsonify({"error": f"Failed to process image for file {file.filename}"}), 500

            db.session.commit()
            source_file = os.path.join('static', uploaded_file.filepath)
            img_io = apply_threshold_to_image(source_file, threshold_value=threshold_value)
            return send_file(img_io, mimetype='image/png', as_attachment=False)

        else:
            return jsonify({"error": "Invalid mode"}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@login_required
@detect_gates_bp.route('/get-circuit-data/<int:file_id>', methods=['GET'])
def get_circuit_analysis_by_file(file_id):
    uploaded_file = UploadedFile.query.get(file_id)
    if not uploaded_file:
        return jsonify({"error": "File not found"}), 404

    circuit_analysis = CircuitAnalysis.query.filter_by(uploaded_file_id=file_id).first()

    if not circuit_analysis:
        return jsonify({"message": "No circuit analysis found for this file"}), 404

    return jsonify({"circuit_analysis": circuit_analysis.to_dict()})


@login_required
@detect_gates_bp.route('/process-detection/<int:file_id>', methods=['POST'])
def detect_logic_gates(file_id):
    mode = request.json.get('mode')
    uploaded_file = UploadedFile.query.get(file_id)
    circuit_analysis = CircuitAnalysis.query.filter_by(uploaded_file_id=file_id).first()
    
    if not uploaded_file:
        return jsonify({"error": "File not found"}), 404

    try:
        if mode == "single":
            source_file = os.path.join('static', uploaded_file.filepath)
            img_io = apply_threshold_to_image(source_file, threshold_value=circuit_analysis.threshold_value)
            cropped_img_io, crop_coords = crop_largest_border(img_io)
            data = infer_image(image_bytes=cropped_img_io, crop_coords=crop_coords)

            filtered_data = filter_detections(data)
            PredictionResult.query.filter_by(circuit_analysis_id=circuit_analysis.id).delete()

            for obj in filtered_data:
                new_prediction = PredictionResult(
                    x=obj['x'],
                    y=obj['y'],
                    width=obj['width'],
                    height=obj['height'],
                    confidence=obj['confidence'],
                    class_name=obj['class'],
                    class_id=obj['class_id'],
                    detection_id=obj['detection_id'],
                    color=(obj['color']),  
                    object_id=obj['object_id'],  
                    label=obj['label'], 
                    circuit_analysis_id=circuit_analysis.id
                )
                db.session.add(new_prediction)

            db.session.commit()

            predictions = PredictionResult.query.filter_by(circuit_analysis_id=circuit_analysis.id).all()
            prediction_dicts = [prediction.to_dict() for prediction in predictions]
            filtered_predictions = filter_detections(prediction_dicts)
            circuit_analysis.predictions = filtered_predictions
            db.session.commit()
            
        elif mode == "multiple":
            task_id = uploaded_file.task_id
            if not task_id:
                return jsonify({"error": "Task ID not found"}), 404

            uploaded_files = UploadedFile.query.filter_by(task_id=task_id).all()
            for file in uploaded_files:
                circuit_analysis = CircuitAnalysis.query.filter_by(uploaded_file_id=file.id).first()
                if circuit_analysis:
                    source_file = os.path.join('static', file.filepath)
                    img_io = apply_threshold_to_image(source_file, threshold_value=circuit_analysis.threshold_value)
                    cropped_img_io, crop_coords = crop_largest_border(img_io)
                    data = infer_image(image_bytes=cropped_img_io, crop_coords=crop_coords)

                    filtered_data = filter_detections(data)
                    PredictionResult.query.filter_by(circuit_analysis_id=circuit_analysis.id).delete()

                    for obj in filtered_data:
                        new_prediction = PredictionResult(
                            x=obj['x'],
                            y=obj['y'],
                            width=obj['width'],
                            height=obj['height'],
                            confidence=obj['confidence'],
                            class_name=obj['class'],
                            class_id=obj['class_id'],
                            detection_id=obj['detection_id'],
                            color=(obj['color']),  # Use the color from filtered data
                            object_id="",  # Empty for now
                            label=obj['label'],  # Use the label from filtered data
                            circuit_analysis_id=circuit_analysis.id
                        )
                        db.session.add(new_prediction)

                    db.session.commit()

                    predictions = PredictionResult.query.filter_by(circuit_analysis_id=circuit_analysis.id).all()
                    prediction_dicts = [prediction.to_dict() for prediction in predictions]

                    circuit_analysis.predictions = prediction_dicts
                    db.session.commit()

        return jsonify({'predictions': circuit_analysis.predictions})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@login_required
@detect_gates_bp.route('/analyze-circuit/<int:file_id>', methods=['POST'])
def analyze_circuit(file_id):
    try:
        uploaded_file = UploadedFile.query.get(file_id)
        circuit_analysis = CircuitAnalysis.query.filter_by(uploaded_file_id=file_id).first()

        if not uploaded_file:
            return jsonify({"error": "File not found"}), 404

        if not circuit_analysis:
            return jsonify({"error": "Circuit analysis not found"}), 404

        source_file = os.path.join('static', uploaded_file.filepath)
        try:
            img_io = apply_threshold_to_image(source_file, threshold_value=circuit_analysis.threshold_value)
        except Exception as e:
            return jsonify({"error": f"Error applying threshold: {str(e)}"}), 500

        try:
            binary_img_io = binarize_image(img_io)
        except Exception as e:
            return jsonify({"error": f"Error binarizing image: {str(e)}"}), 500

        try:
            mask_img_io = mask_image(binary_img_io, circuit_analysis.predictions)
        except Exception as e:
            return jsonify({"error": f"Error masking image: {str(e)}"}), 500

        try:
            boolean_functions, input_count = process_circuit_connection(mask_img_io, circuit_analysis.predictions)
        except Exception as e:
            return jsonify({"error": f"Error processing circuit connections: {str(e)}"}), 500

        try:
            expressions = []
            for key, value in boolean_functions.items():
                print(f"Processing key: {key}, value: {value}")
                symp_expression = convert_to_sympy_expression(value, input_count)
                expressions.append({key: str(symp_expression)})
                
            sorted_expressions = sorted(expressions, key=lambda x: list(x.keys())[0])
            circuit_analysis.boolean_expressions = sorted_expressions
            db.session.commit()
        except Exception as e:
            return jsonify({"error": f"Error converting to sympy expressions: {str(e)}"}), 500

        print(sorted_expressions)
        # Generate Truth Table
        try:
            truth_table_dict = {}
            for idx, expression in enumerate(sorted_expressions):
                for key, value in expression.items():
                    try:
                        sympy_expression = string_to_sympy_expression(value)
                    except SympifyError:
                        return jsonify({"error": f"Failed to parse boolean expression: {value}"}), 400

                    truth_table = generate_truth_table(sympy_expression, input_count)
                    truth_table_dict[f"OUT {idx + 1}"] = [[str(item) for item in row] for row in truth_table]

            circuit_analysis.truth_table = truth_table_dict
            db.session.commit()
        except Exception as e:
            return jsonify({"error": f"Error generating truth table: {str(e)}"}), 500

        return jsonify({
            "boolean_expressions": expressions,
            "truth_table": truth_table_dict
        })

    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@login_required
@detect_gates_bp.route('/validate-expression', methods=['POST'])
def validate_expression():
    expression = request.json.get('expression')
    result = is_expression_valid(expression)
    return jsonify({"valid": result})

@login_required
@detect_gates_bp.route('/generate-truth-table', methods=['POST'])
def gen_truth_table():
    expressions = request.json.get('expressions')
    truth_table_dict = {}
    
    input_count = count_inputs(expressions)
    try:
        try:
            if not expressions:
                return jsonify({"error": "No Expressions"}), 404
        except:
            print("Error")
        for idx, expression in enumerate(expressions):
                # value = expression.split('=')[1] - use to split
            try:
                sympy_expression = string_to_sympy_expression(expression)
            except SympifyError:
                return jsonify({"error": f"Failed to parse boolean expression: {expression}"}), 400
            
            try:
                truth_table = generate_truth_table(sympy_expression, input_count)
            except Exception as e:
                return jsonify({"error": f"Error generating truth table: {str(e)}"}), 500
                    
            truth_table_dict[f"OUT {idx + 1}"] = [ [str(item) for item in row] for row in truth_table ]
                
        return jsonify({"truth_table": truth_table_dict})
    
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


@login_required
@detect_gates_bp.route('/export-verilog/<int:file_id>', methods=['GET'])
def get_exported_verilog(file_id):
    circuit_analysis = CircuitAnalysis.query.filter_by(uploaded_file_id=file_id).first()
    
    expression_dict_list = circuit_analysis.boolean_expressions

    combined_expression_dict = {}
    for expression in expression_dict_list:
        combined_expression_dict.update(expression)  
    verilog_content = export_to_verilog(combined_expression_dict)
    verilog_file = io.StringIO(verilog_content)
    verilog_filename = f"circuit_{file_id}.asc"

    return send_file(
        io.BytesIO(verilog_file.getvalue().encode('utf-8')),
        mimetype='text/plain',
        as_attachment=True,
        download_name=verilog_filename 
    )

@login_required
@detect_gates_bp.route('/generate-netlist/<int:file_id>', methods=['GET'])
def generate_netlist(file_id):
    circuit_analysis = CircuitAnalysis.query.filter_by(uploaded_file_id=file_id).first()
    
    expression_dict_list = circuit_analysis.boolean_expressions

    combined_expression_dict = {}
    for expression in expression_dict_list:
        combined_expression_dict.update(expression)  
    netlist_content = generate_ltspice_netlist(combined_expression_dict)
    print("Netliist", netlist_content)
    netlist_file = io.StringIO(netlist_content)
    netlist_filename = f"circuit_{file_id}.asc"


    return send_file(
        io.BytesIO(netlist_file.getvalue().encode('utf-8')),
        mimetype='text/plain',
        as_attachment=True,
        download_name=netlist_filename 
    )

@login_required
@detect_gates_bp.route('/edit-prediction/<int:circuit_analysis_id>', methods=['PUT'])
def edit_prediction(circuit_analysis_id):
    prediction_id = request.json.get('predictionId')
    class_name = request.json.get('className')
    if not prediction_id or not class_name:
        return jsonify({"error": "Both detectionId and className are required"}), 400

    circuit_analysis = CircuitAnalysis.query.filter_by(id=circuit_analysis_id).first()
    if not circuit_analysis:
        return jsonify({"error": f"CircuitAnalysis with id {circuit_analysis_id} not found"}), 404

    prediction = next((pred for pred in circuit_analysis.predictions if pred['id'] == prediction_id), None)
    if not prediction:
        return jsonify({"error": f"Prediction with prediction_id {prediction_id} not found"}), 404

    update_prediction = PredictionResult.query.filter_by(id=prediction['id']).first()
    if not update_prediction:
        return jsonify({"error": f"PredictionResult with id {prediction['id']} not found"}), 404

    update_prediction.class_name = class_name
    db.session.commit()
    
    try:
        predictions = PredictionResult.query.filter_by(circuit_analysis_id=circuit_analysis.id).all()
        prediction_dicts = [prediction.to_dict() for prediction in predictions]
        filtered_predictions = filter_detections(prediction_dicts)
        circuit_analysis.predictions = filtered_predictions
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to save changes", "details": str(e)}), 500

    return jsonify({
        "message": "Prediction updated and detections filtered successfully",
        "prediction": {
            "id": update_prediction.id,
            "detection_id": update_prediction.detection_id,
            "class_name": update_prediction.class_name,
        },
        "filtered_predictions": filtered_predictions
    }), 200


@login_required
@detect_gates_bp.route('/delete-prediction/<int:prediction_id>', methods=['DELETE'])
def delete_prediction(prediction_id):
    try:
        prediction = PredictionResult.query.get(prediction_id)
        if not prediction:
            return jsonify({"error": "Prediction not found"}), 404

        circuit_analysis_id = prediction.circuit_analysis_id
        db.session.delete(prediction)
        db.session.commit()

        circuit_analysis = CircuitAnalysis.query.filter_by(id=circuit_analysis_id).first()
        if not circuit_analysis:
            return jsonify({"error": f"CircuitAnalysis with id {circuit_analysis_id} not found"}), 404

        try:
            predictions = PredictionResult.query.filter_by(circuit_analysis_id=circuit_analysis.id).all()
            prediction_dicts = [prediction.to_dict() for prediction in predictions]
            filtered_predictions = filter_detections(prediction_dicts)
            circuit_analysis.predictions = filtered_predictions
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to update CircuitAnalysis predictions", "details": str(e)}), 500

        return jsonify({"message": "Prediction deleted and CircuitAnalysis updated successfully",
                        'filtered_predictions': filtered_predictions}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete prediction", "details": str(e)}), 500
    
    
def are_predictions_similar(pred1, pred2, margin_of_error=5):
    similar = (
        pred1['class_name'] == pred2['class_name'] and
        abs(pred1['x'] - pred2['x']) <= margin_of_error and
        abs(pred1['y'] - pred2['y']) <= margin_of_error and
        abs(pred1['confidence'] - pred2['confidence']) <= margin_of_error
    )
    return similar

def are_all_predictions_similar(predictions1, predictions2, margin_of_error=5):
    if not predictions1 or not predictions2:
        return False
    
    if len(predictions1) != len(predictions2):
        print(f"Different number of predictions: {len(predictions1)} vs {len(predictions2)}")
        return False

    return all(
        any(are_predictions_similar(pred1, pred2, margin_of_error) for pred2 in predictions2)
        for pred1 in predictions1
    )

@detect_gates_bp.route('/flag-similar-circuits', methods=['GET'])
def flag_similar_circuits():
    try:
        margin_of_error = request.args.get('margin_of_error', default=5, type=int)
        circuit_analyses = CircuitAnalysis.query.all()
        
        valid_circuits = [c for c in circuit_analyses if c.predictions]
        
        flagged_circuits = []

        for i, circuit1 in enumerate(valid_circuits):
            for j, circuit2 in enumerate(valid_circuits):
                if i >= j:
                    continue
                if are_all_predictions_similar(circuit1.predictions, circuit2.predictions, margin_of_error):
                    flagged_circuits.append((circuit1.id, circuit2.id))
        return jsonify({"flagged_circuits": flagged_circuits})
    except Exception as e:
        return jsonify({"error": str(e)}), 500