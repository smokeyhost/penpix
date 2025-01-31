import cv2
from pyzbar.pyzbar import decode
from werkzeug.utils import secure_filename
from PIL import Image
import numpy as np
import qrcode
import json
import os
import fitz  # PyMuPDF
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

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
    """Append a QR code to a template image and save as a PDF."""
    
    qr_code = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=5,
        border=2
    )
    task_id = data.split('|')[0]
    qr_code.add_data(data)
    qr_code.make(fit=True)
    qr_img = qr_code.make_image(fill_color="black", back_color="white")
    qr_img = qr_img.resize((size, size))

    template = Image.open(template_path)

    if template.mode in ("RGBA", "LA"):
        white_bg = Image.new("RGB", template.size, (255, 255, 255)) 
        white_bg.paste(template, mask=template.split()[3])  
        template = white_bg  

    template.paste(qr_img, position)

    temp_image_path = os.path.join(output_path, 'temp_image.jpg') 
    template.save(temp_image_path, format="JPEG", quality=95)

    pdf_filename = secure_filename(f'template-{task_id}.pdf')
    pdf_filepath = os.path.join(output_path, pdf_filename)
    
    c = canvas.Canvas(pdf_filepath, pagesize=letter)
    c.drawImage(temp_image_path, 0, 0, width=letter[0], height=letter[1])
    c.save()

    os.remove(temp_image_path)
    
    return pdf_filepath

def extract_qr_code_from_pdf(pdf_path):
    """Extract QR code data from a PDF file."""
    doc = fitz.open(pdf_path)
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap()
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        qr_data, qr_code = extract_qr_code_data(img)
        if qr_data:
            return qr_data, qr_code
    return None, None

# if __name__ == "__main__":
#     input_file_path = './output/template-1000_AM.pdf'  

#     if input_file_path.lower().endswith('.pdf'):
#         qr_data, qr_code = extract_qr_code_from_pdf(input_file_path)
#     else:
#         image = Image.open(input_file_path)
#         corrected_image, qr_data = determine_proper_orientation(image)

#     if qr_data is None:
#         print("No QR codes found.")s
#     else:
#         print("QR Code Data:", qr_data)
#         if not input_file_path.lower().endswith('.pdf'):
#             print("Image rotated and saved successfully.")

    # data = "10:00 AM|12:00 PM"
    
    # template_path = 'template.png'
    # output_path = 'sampleImage.png'
    
    # output_dir = 'output'  # Ensure this directory exists
    # position = (200, 80)  # Adjust position as needed

    # if not os.path.exists(output_dir):
    #     os.makedirs(output_dir)

    # append_qr_code_to_template(data, size=220, template_path=template_path, output_path=output_dir, position=position)
    # print('QR code appended to template successfully!')