from collections import defaultdict
import string

def distance(p1, p2):
    return ((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2) ** 0.5

def add_color_property_and_ids(detections):
    class_colors = {
        'and': (0, 0, 255),          # Red
        'input': (0, 255, 0),        # Green
        'junction': (255, 0, 0),     # Blue
        'nand': (0, 255, 255),       # Yellow
        'nor': (255, 255, 0),        # Cyan
        'not': (255, 0, 255),        # Magenta
        'or': (128, 0, 128),         # Purple
        'output': (0, 128, 128),     # Teal
        'xnor': (128, 128, 0),       # Olive
        'xor': (148, 3, 252),        # Light violet
        'intersection': (0, 128, 255) # Orange-Blue for Intersection
    }

    # Initialize counters for each class type
    id_counters = {
        'input': 1,
        'output': 1,
        'junction': 1,
        'intersection': 1,
        'other': 1  # For all other logic gates
    }

    # Add color property and IDs based on the class
    for detection in detections:
        class_name = detection['class'] if 'class' in detection else detection['class_name']
        detection['color'] = class_colors.get(class_name, (255, 255, 255))  # Default to white if class is not found

        if class_name == 'input':
            detection['object_id'] = f'IN{id_counters["input"]}'
            detection['label'] = f'X{id_counters["input"]}'
            id_counters['input'] += 1
        elif class_name == 'output':
            detection['object_id'] = f'OUT{id_counters["output"]}'
            detection['label'] = f'Y{id_counters["output"]}'
            id_counters['output'] += 1
        elif class_name == 'junction':
            detection['object_id'] = f'J{id_counters["junction"]}'
            detection['label'] = ''
            id_counters['junction'] += 1
        elif class_name == 'intersection':
            detection['object_id'] = f'I{id_counters["intersection"]}'
            detection['label'] = ''
            id_counters['intersection'] += 1
        else:  # For logic gates like and, or, nand, etc.
            detection['object_id'] = f'U{id_counters["other"]}'
            detection['label'] = ''
            id_counters['other'] += 1


def filter_detections(detections):
    # Group detections by their position with a specified threshold
    grouped_detections = defaultdict(list)
    threshold = 10  # Adjust threshold as needed

    for detection in detections:
        found_group = False
        for group_key in grouped_detections.keys():
            if distance(group_key[:2], (detection["x"], detection["y"])) <= threshold:
                grouped_detections[group_key].append(detection)
                found_group = True
                break
        if not found_group:
            grouped_detections[(detection["x"], detection["y"], detection["width"], detection["height"])].append(detection)

    # Keep only detections with the highest confidence level in each group
    filtered_data = []
    for group in grouped_detections.values():
        max_confidence_detection = max(group, key=lambda x: x["confidence"])
        filtered_data.append(max_confidence_detection)

    add_color_property_and_ids(filtered_data)

    return filtered_data
