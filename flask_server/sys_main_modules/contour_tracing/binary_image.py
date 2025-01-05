import cv2
import numpy as np
from io import BytesIO

def draw_contour(img):
    contours, _ = cv2.findContours(img, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    filtered_contours = [contour for contour in contours if cv2.contourArea(contour) > 200]
    contour_img = np.zeros_like(img)
    cv2.drawContours(contour_img, filtered_contours, -1, (255, 255, 255), thickness=cv2.FILLED)

    return contour_img

def binarize_image(image_bytes: BytesIO) -> BytesIO:
    img_array = np.frombuffer(image_bytes.read(), np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_GRAYSCALE)
    inverted_img = cv2.bitwise_not(img)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    dilate = cv2.dilate(inverted_img, kernel, iterations=2)
    erode = cv2.erode(dilate, kernel, iterations=2)
    
    contour_img = draw_contour(erode)
    _, encoded_img = cv2.imencode('.png', contour_img)
    output_bytes = BytesIO(encoded_img.tobytes())
    
    return output_bytes