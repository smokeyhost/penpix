import cv2
import numpy as np
from io import BytesIO

def crop_largest_border(encoded_image):
    image_array = np.frombuffer(encoded_image.getbuffer(), dtype=np.uint8)
    grayscale_image = cv2.imdecode(image_array, cv2.IMREAD_GRAYSCALE)

    edges = cv2.Canny(grayscale_image, 50, 150)
    kernel = np.ones((5, 5), np.uint8)
    edges_dilated = cv2.dilate(edges, kernel, iterations=1)
    edges_eroded = cv2.erode(edges_dilated, kernel, iterations=1)

    contours, _ = cv2.findContours(edges_eroded, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        raise ValueError("No contours found in the image")

    largest_contour = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest_contour)
    cropped_image = grayscale_image[y:y+h, x:x+w]

    is_success, buffer = cv2.imencode(".png", cropped_image)
    if not is_success:
        raise ValueError("Error encoding cropped image")

    return BytesIO(buffer), (x, y, w, h)