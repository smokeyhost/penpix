import cv2
from pyzbar.pyzbar import decode
from werkzeug.utils import secure_filename
from PIL import Image
import numpy as np
import qrcode
import json
import os


def rotate_image(image, angle):
    """Rotate the image by the specified angle."""
    return image.rotate(angle, expand=True)

def extract_qr_code_data(image):
    """Extract QR code data and bounding polygon from the image."""
    decoded_objects = decode(image)
    if not decoded_objects:
        return None, None

    qr_code = decoded_objects[0]
    qr_data = qr_code.data.decode('utf-8')
    
    if qr_data is None:
        return None, None

    # try:
    #     qr_data = json.loads(qr_data)
    #     print("Qr Data", qr_data)
    # except json.JSONDecodeError:
    #     qr_data = None
    
    return qr_data, qr_code

def calculate_rotation_angle(qr_code):
    """Calculate the angle required to orient the QR code correctly."""
    if qr_code.polygon is not None:
        points = np.array([[point.x, point.y] for point in qr_code.polygon], dtype=np.float32)
        rect = cv2.minAreaRect(points)
        angle = rect[2]

        # Adjust the angle based on the rectangle's width and height
        if rect[1][0] < rect[1][1]:
            angle = -(90 + angle)
        else:
            angle = -angle

        return angle

    return 0

def determine_rotation_from_orientation(orientation):
    """Map QR code orientation to rotation angle."""
    orientation_mapping = {
        'UP': 0,
        'RIGHT': 90,
        'DOWN': 180,
        'LEFT': -90
    }
    return orientation_mapping.get(orientation, 0)
  
def determine_proper_orientation(image):
    """Analyze and correct the orientation of the QR code in the image."""
    qr_data, qr_code = extract_qr_code_data(image)
    
    if qr_data is None:
        return image, None

    if hasattr(qr_code, 'orientation') and qr_code.orientation:
        angle = determine_rotation_from_orientation(qr_code.orientation)
    else:
        angle = 0  

    rotated_image = rotate_image(image, angle)
    return rotated_image, qr_data


def save_image(image, output_path):
    """Save the image to the specified path."""
    image.save(output_path)

def generate_qr_code_from_dict(data_dict, size, output_file):
    """Generate a QR code from a dictionary and save it."""
    json_data = json.dumps(data_dict)
    
    qr_code = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4
    )
    qr_code.add_data(json_data)
    qr_code.make(fit=True)
    img = qr_code.make_image(fill_color="black", back_color="white")
    img = img.resize((size, size))
    img.save(output_file)

def append_qr_code_to_template(data, size, template_path, output_path, position):
    """Append a QR code to a template image at the specified position."""
    qr_code = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4
    )
    qr_code.add_data(data)
    qr_code.make(fit=True)
    qr_img = qr_code.make_image(fill_color="black", back_color="white")

    template = Image.open(template_path)
    qr_img = qr_img.resize((size, size))

    filename = secure_filename(f'template-{data['task_id']}.png')
    filepath = os.path.join(output_path, filename)
    
    template.paste(qr_img, position)
    template.save(filepath)
    
    return filepath


# if __name__ == "__main__":
#     input_image_path = 'sampleImage.png'  
#     output_image_path = 'rotatedImage.png'

#     image = Image.open(input_image_path)
#     corrected_image, qr_data = determine_proper_orientation(image)

#     if qr_data is None:
#         print("No QR codes found.")
#     else:
#         save_image(corrected_image, output_image_path)
#         print("QR Code Data:", qr_data)
#         print("Image rotated and saved successfully.")

    # data = {
    #     "course": "CPE 2301",
    #     "schedule": "1230123u819u312u8hubfdhjf2iyhki3uiffui2gfukfdjsfiuwfbdsjfgui",
    #     "instructor": "Dr. Smith",
    #     "time": "10:00 AM - 12:00 PM"
    # }
    
    # template_path = 'template.jpg'
    # output_path = 'sampleImage.png'
    # position = (124, 18)  # Adjust position as needed

    # append_qr_code_to_template(data, size=150, template_path=template_path, output_path=output_path, position=position)
    # print('QR code appended to template successfully!')
