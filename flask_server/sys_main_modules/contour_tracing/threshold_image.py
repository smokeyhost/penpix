import cv2
import os
from io import BytesIO

def apply_threshold_to_images(source_folder, threshold_value=100):
    image_extensions = ['.jpg', '.jpeg', '.png']
    processed_images = {}

    for filename in os.listdir(source_folder):
        if any(filename.lower().endswith(ext) for ext in image_extensions):
            full_path = os.path.join(source_folder, filename)
            img = cv2.imread(full_path, cv2.IMREAD_GRAYSCALE)

            if img is not None:
                _, thresholded_image = cv2.threshold(img, threshold_value, 255, cv2.THRESH_BINARY)

                is_success, buffer = cv2.imencode(".png", thresholded_image)
                if is_success:
                    processed_images[filename] = BytesIO(buffer)

    return processed_images  

def apply_threshold_to_image(source_file, threshold_value=100):
    img = cv2.imread(source_file, cv2.IMREAD_GRAYSCALE)

    if img is None:
        print(f"Error loading image: {source_file}")
        return None


    _, thresholded_image = cv2.threshold(img, threshold_value, 255, cv2.THRESH_BINARY)
    
    is_success, buffer = cv2.imencode(".png", thresholded_image)
    
    if not is_success:
        print("Error encoding image")
        return None

    return BytesIO(buffer)
