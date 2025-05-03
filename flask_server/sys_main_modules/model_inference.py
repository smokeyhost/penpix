import numpy as np
from . import model_detection
import cv2
import tempfile
import sys
from .models.experimental import attempt_load
from .utilities.torch_utils import select_device
import onnxruntime as ort
import os

sys.path.insert(0, './sys_main_modules')
weights = './sys_main_modules/weight/logic_gate.pt'
onnx_path = './sys_main_modules/weight/yolov7-simplified_none.onnx'

session = None
if os.path.exists(onnx_path):
    try:
        session = ort.InferenceSession(onnx_path, providers=["CPUExecutionProvider"])
        dummy_input = np.random.rand(1, 3, 640, 640).astype(np.float32)
        input_name = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name
        session.run([output_name], {input_name: dummy_input})
        print("Running ONNX session")
    except Exception as e:
        print(f"Error loading ONNX model: {str(e)}")
else:
    print(f"ONNX model file not found: {onnx_path}")

model = None
device=None
if os.path.exists(weights):
    try:
        device = select_device('cpu')
        model = attempt_load(weights, map_location=device)
        print("PyTorch model loaded")
    except Exception as e:
        print(f"Error loading PyTorch model: {str(e)}")
else:
    print(f"PyTorch weights file not found: {weights}")


def infer_image(image_bytes, crop_coords):
    try:
        img_array = np.frombuffer(image_bytes.read(), np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_GRAYSCALE)
        
        if img is None:
            return {"error": "Invalid image data"}

        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
            temp_filepath = temp_file.name
            cv2.imwrite(temp_filepath, img) 

        img_size = 640
        # data = model_detection.detect(source=temp_filepath, weights=weights, img_size=img_size,
        #                               save_img=False, view_img=False, save_txt=False, save_trace=False)
        
        data = model_detection.detect_objects(img_path=temp_filepath, model=model, device=device, img_size=img_size)
        # data = model_detection.detect_objects_onnx(img_path=temp_filepath, img_size=img_size, session=session)
        
        
        if not data:
            return {"error": "No objects detected in the image"}
        
        x_offset, y_offset, _,_ = crop_coords
        for detection in data:
            detection['x'] += x_offset
            detection['y'] += y_offset
            # detection['width'] += x_offset
            # detection['height'] += y_offset

        return data

    except Exception as e:
        return {"error": str(e)}
