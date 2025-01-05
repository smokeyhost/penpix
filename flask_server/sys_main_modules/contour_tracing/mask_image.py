import cv2 as cv
import numpy as np
from io import BytesIO

def mask_image(image_bytes: BytesIO, data: list) -> BytesIO:
    """Draw rectangles on the image based on the provided data."""
    img_array = np.frombuffer(image_bytes.read(), np.uint8)
    image = cv.imdecode(img_array, cv.IMREAD_COLOR)
    
    if image is None:
        raise ValueError("Image data could not be decoded.")
    
    image_copy = image.copy()
    for value in data:
        top_left = (value['x'], value['y'])
        bottom_right = (value['x'] + value['width'], value['y'] + value['height'])
        cv.rectangle(image_copy, top_left, bottom_right, (255,255,255), -1)

        # Uncomment this line if you want to add text
        # cv.putText(image_copy, value['id'], (value['x'] + value['width']//3, value['y'] + value['height']//2), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)
   
    _, encoded_img = cv.imencode('.png', image_copy)
    output_bytes = BytesIO(encoded_img.tobytes())
    
    return output_bytes
