from collections import defaultdict
import string

def distance(p1, p2):
    return ((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2) ** 0.5

def add_color_property_and_ids(detections):
    class_colors = {
        'and': (0, 0, 255),
        'input': (0, 255, 0),
        'junction': (255, 0, 0),
        'nand': (0, 255, 255),
        'nor': (255, 100, 0),
        'not': (255, 0, 255),
        'or': (128, 0, 128),
        'output': (0, 128, 128),
        'xnor': (128, 128, 0),
        'xor': (148, 3, 252),
        'intersection': (0, 128, 255)
    }
    groups = {'input': [], 'output': [], 'junction': [], 'intersection': [], 'other': []}
    for detection in detections:
        class_name = detection.get('class', detection.get('class_name'))
        detection['color'] = class_colors.get(class_name, (255, 255, 255))
        if class_name in groups:
            groups[class_name].append(detection)
        else:
            groups['other'].append(detection)
    groups['input'].sort(key=lambda d: d['x'])
    for i, detection in enumerate(groups['input'], start=1):
        detection['object_id'] = f'IN{i}'
        detection['label'] = f'X{i}'
    groups['output'].sort(key=lambda d: d['y'])
    for i, detection in enumerate(groups['output'], start=1):
        detection['object_id'] = f'OUT{i}'
        detection['label'] = f'Y{i}'
    groups['junction'].sort(key=lambda d: (d['y'], d['x']))
    for i, detection in enumerate(groups['junction'], start=1):
        detection['object_id'] = f'J{i}'
        detection['label'] = f'J{i}'
    groups['intersection'].sort(key=lambda d: (d['y'], d['x']))
    for i, detection in enumerate(groups['intersection'], start=1):
        detection['object_id'] = f'I{i}'
        detection['label'] = f'I{i}'
    if groups['other']:
        xs = [d['x'] for d in groups['other']]
        avg_x = sum(xs) / len(xs)
        left_column = [d for d in groups['other'] if d['x'] < avg_x]
        right_column = [d for d in groups['other'] if d['x'] >= avg_x]
        left_column.sort(key=lambda d: d['y'])
        right_column.sort(key=lambda d: d['y'])
        for i, detection in enumerate(left_column, start=1):
            detection['object_id'] = f'U{i}'
            detection['label'] = f'U{i}'
        for i, detection in enumerate(reversed(right_column), start=len(left_column) + 1):
            detection['object_id'] = f'U{i}'
            detection['label'] = f'U{i}'
        groups['other'] = left_column + right_column
        # groups['other'] = left_column + right_column

def filter_detections(detections):
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
