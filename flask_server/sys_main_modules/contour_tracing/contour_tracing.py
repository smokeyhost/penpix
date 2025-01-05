import cv2 as cv
import numpy as np

def line_boundary_tracing(image, start_points, stop_points, intersection_points, junction_points):
    def is_black(pixel_value):
        return np.all(pixel_value == 0)

    height, width = image.shape[:2]
    directions = [(-1, -1), (-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1)]

    # Create a mapping of stop coordinates to IDs, labels, and types
    stop_coords_to_id = {}
    for point in stop_points:
        if 'input1' in point:
            stop_coords_to_id[point['input1']] = {
                'object_id': point['object_id'], 
                'label': point.get('label'), 
                'type': point['type'],
                'pin': 'input1'
            }
        if 'input2' in point:
            stop_coords_to_id[point['input2']] = {
                'object_id': point['object_id'], 
                'label': point.get('label'), 
                'type': point['type'],
                'pin': 'input2'
            }

    # Create a mapping of junction coordinates to IDs and input/output points
    junction_coords_to_id = {}
    input_coords = {}
    output_coords = {}

    for junction in junction_points:
        junction_id = junction['object_id']
        for point_dict in junction['input_points']:
            for side, pt in point_dict.items():
                junction_coords_to_id[tuple(pt)] = junction_id
                input_coords[tuple(pt)] = side
        for point_dict in junction['output_points']:
            for side, pt in point_dict.items():
                output_coords[tuple(pt)] = (junction_id, side)

    # Collect start coordinates
    start_coords = {point['output']: {
            'object_id': point['object_id'], 
            'label': point.get('label'), 
            'type': point['type']
        } for point in start_points}

    def trace_from_point(start_point, start_info, stop_coords_to_id, junction_coords_to_id, input_coords, output_coords, intersection_points, directions, visited=None):
        if visited is None:
            visited = set()

        start_id = start_info['object_id']
        start_label = start_info.get('label')
        start_type = start_info.get('type')
        current_point = start_point
        current_direction = 0
        line_boundary = []
        connections = []

        line_boundary.append(current_point)
        visited.add(current_point)

        while True:
            found_next_point = False
            for i in range(8):
                next_direction = (current_direction + i) % 8
                next_point = (current_point[0] + directions[next_direction][1], current_point[1] + directions[next_direction][0])

                if 0 <= next_point[0] < width and 0 <= next_point[1] < height:
                    next_pixel_value = image[next_point[1], next_point[0]]
                    if next_point not in visited:
                        if next_point in stop_coords_to_id:
                            line_boundary.append(next_point)
                            stop_info = stop_coords_to_id[next_point]
                            connections.append({
                                'from': {
                                    'object_id': start_id, 
                                    'label': start_label, 
                                    'type': start_type
                                },
                                'to': {
                                    'object_id': stop_info['object_id'], 
                                    'label': stop_info.get('label'), 
                                    'type': stop_info.get('type'),
                                    'pin': stop_info.get('pin')
                                },
                                'connected_points': [start_point, next_point]
                            })
                            return line_boundary, connections

                        if is_black(next_pixel_value):
                            jump = False
                            for pair in intersection_points:
                                if next_point in pair:
                                    jump_point = pair[next_point]
                                    line_boundary.append(next_point)
                                    line_boundary.append(jump_point)
                                    current_point = jump_point
                                    current_direction = (next_direction + 6) % 8
                                    visited.add(next_point)
                                    visited.add(jump_point)
                                    intersection_points.remove(pair)
                                    found_next_point = True
                                    jump = True
                                    break
                            if jump:
                                break

                            if next_point in junction_coords_to_id:
                                junction_id = junction_coords_to_id[next_point]
                                line_boundary.append(next_point)
                                
                                entry_side = input_coords[next_point]

                                # Override junction object_id and type with the start component's object_id and type
                                new_start_id = start_id  # Use the start_id for outputs of the junction
                                new_start_type = start_type  # Use the start_type for outputs of the junction
                                
                                for junction in junction_points:
                                    if junction['object_id'] == junction_id:
                                        for point_dict in junction['output_points']:
                                            for side, out_point in point_dict.items():
                                                if side != entry_side and tuple(out_point) not in visited:
                                                    start_coords[tuple(out_point)] = {
                                                        'object_id': new_start_id,  # Use the overridden object_id here
                                                        'label': start_label, 
                                                        'type': new_start_type  # Use the overridden type here
                                                    }

                                connections.append({
                                    'from': {
                                        'object_id': new_start_id,  # Use the overridden object_id here
                                        'label': start_label, 
                                        'type': new_start_type  # Use the overridden type here
                                    },
                                    'to': {
                                        'object_id': junction_id, 
                                        'label': None, 
                                        'type': 'junction'
                                    },
                                    'connected_points': [start_point, next_point]
                                })
                                return line_boundary, connections

                            line_boundary.append(next_point)
                            current_point = next_point
                            current_direction = (next_direction + 6) % 8
                            visited.add(current_point)
                            found_next_point = True
                            break

            if not found_next_point or (current_point == start_point and len(line_boundary) > 1):
                break

        return line_boundary, connections


    all_boundaries = []
    all_connections = []

    processed_start_points = set()
    processed_stop_points = set()

    while start_coords:
        start_point, start_info = next(iter(start_coords.items()))
        
        # Check if this start_point has already been processed
        if start_point in processed_start_points:
            del start_coords[start_point]
            continue

        # Trace from this start_point
        boundary, connections = trace_from_point(
            start_point, start_info, stop_coords_to_id, junction_coords_to_id, input_coords, output_coords, intersection_points, directions
        )
        
        if boundary:
            all_boundaries.extend(boundary)
            all_connections.extend(connections)
            
            # Add start_point to processed set
            processed_start_points.add(start_point)

        # Remove the start_point from start_coords
        del start_coords[start_point]

        # Check each connection for duplicates and add to the processed set
        for connection in connections:
            if connection['from']['object_id'] not in processed_stop_points:
                processed_stop_points.add(connection['from']['object_id'])
            if connection['to']['object_id'] not in processed_stop_points:
                processed_stop_points.add(connection['to']['object_id'])


    return all_boundaries, all_connections


def get_junction_points(image, data):
    points_list = []

    for prediction in data:
        if prediction['class_name'] == 'junction':
            x, y, width, height = prediction['x'], prediction['y'], prediction['width'], prediction['height']
            points = {'object_id': prediction['object_id'], 'type': prediction['class_name'], 'input_points': [], 'output_points': []}

            # Get left input point
            x_left_input, y_left_input = x, y
            while True:
                if y_left_input == 0 or y_left_input + height <= y:
                    break
                if np.all(image[y_left_input + height, x_left_input - 1] == 255):
                    points['input_points'].append({'left': (x_left_input - 1, y_left_input + height + 1)})
                    # cv.circle(image_copy, (x_left_input - 1, y_left_input + height + 1), 1, (0, 0, 255), -1)
                    break
                else:
                    y_left_input -= 1


            # Get left output point
            x_left_output, y_left_output = x, y
            while True:
                if y_left_output == 0 or y_left_output >= y + height:
                    break
                if np.all(image[y_left_output, x_left_output - 1] == 255):
                    points['output_points'].append({'left':(x_left_output - 1, y_left_output - 1)})
                    # cv.circle(image_copy, (x_left_output - 1, y_left_output - 1), 1, (0, 0, 255), -1)
                    break
                else:
                    y_left_output += 1


            # Get right input point
            x_right_input, y_right_input = x, y
            while True:
                if y_right_input == 0 or y_right_input >= y + height:
                    break
                if np.all(image[y_right_input, x_right_input + 1 + width] == 255):
                    points['input_points'].append({'right':(x_right_input + 1, y_right_input - 1)})
                    # cv.circle(image_copy, (x_right_input + 1 + width, y_right_input - 1), 1, (0, 0, 255), -1)
                    break
                else:
                    y_right_input += 1


            # Get right output point
            x_right_output, y_right_output = x, y
            while True:
                if y_right_output == 0 or y_right_output + height <= y:
                    break
                if np.all(image[y_right_output + height, x_right_output + width + 1] == 255):
                    points['output_points'].append({'right':(x_right_output + 1 + width, y_right_output + height + 1)})
                    break
                else:
                    y_right_output -= 1


            # Get top input point
            x_top_input, y_top_input = x, y
            while True:
                if x_top_input == 0 or x_top_input >= x + width:
                    break
                if np.all(image[y_top_input - 1, x_top_input] == 255):
                    points['input_points'].append({'top':(x_top_input - 1, y_top_input - 1)})
                    break
                else:
                    x_top_input += 1


            #Get top output point:
            x_top_output, y_top_output = x, y
            while True:
                if x_top_output == 0 or x_top_output + width <= x:
                    break
                if np.all(image[y_top_output - 1, x_top_output + width] == 255):
                    points['output_points'].append({'top':(x_top_output + 1 + width, y_top_output - 1)})
                    break
                else:
                    x_top_output -= 1


            # Get bottom output point
            x_bottom_output, y_bottom_output = x, y
            while True:
                if x_bottom_output == 0 or x_bottom_output >= x + width:
                    break
                if np.all(image[y_bottom_output + height + 1, x_bottom_output] == 255):
                    points['output_points'].append({'bottom':(x_bottom_output - 1, y_bottom_output + height + 1)})
                    break
                else:
                    x_bottom_output += 1

            #Get bottom input point:
            x_bottom_input, y_bottom_input = x, y
            while True:
                if x_bottom_input == 0 or x_bottom_input + width <= x:
                    break
                if np.all(image[y_bottom_input + 1 + height, x_bottom_input + width] == 255):
                    points['input_points'].append({'bottom':(x_bottom_input + 1 + width, y_bottom_input + 1 + height)})
                    break
                else:
                    x_bottom_input -= 1

            if points['input_points']:  # Only add to list if there are valid points
                points_list.append(points)


    return points_list

def get_intersection_points(image, data):
    points_list = []

    for prediction in data:
        if prediction['class_name'] == 'intersection':
            x, y, width, height = prediction['x'], prediction['y'], prediction['width'], prediction['height']
            points = {'object_id': prediction['object_id']}

            # Get left point
            xleft, yleft = x, y
            while True:
                if yleft == 0:
                    break
                if np.all(image[yleft + height, xleft - 1] == 255):
                    points['left'] = (xleft - 1, yleft + height + 1)
                    break
                else:
                    yleft -= 1

            # Get right point
            xright, yright = x, y
            while True:
                if yright == 0:
                    break
                if np.all(image[yright + height, xright + width + 1] == 255):
                    points['right'] = (xright + 1 + width, yright + height + 1)
                    break
                else:
                    yright -= 1

            # Get top point
            xtop, ytop = x, y
            while True:
                if ytop == 0:
                    break
                if np.all(image[ytop - 1, xtop] == 255):
                    points['top'] = (xtop - 1, ytop - 1)
                    # print(image[ytop - 1, xtop - 1])
                    break
                else:
                    xtop += 1

            # Get bottom point
            xbottom, ybottom = x, y
            while True:
                if ybottom == 0:
                    break
                if np.all(image[ybottom + height + 1, xbottom] == 255):
                    points['bottom'] = (xbottom - 1, ybottom + height + 1)
                    break
                else:
                    xbottom += 1

            if 'left' in points and 'right' in points:
                points_list.append({points['left']: points['right'], points['right']: points['left']})
            if 'top' in points and 'bottom' in points:
                points_list.append({points['top']: points['bottom'], points['bottom']: points['top']})

    return points_list


def get_endpoints(image, data):
    end_points = []
    exclude_class = ['junction', 'intersection', 'input']

    for prediction in data:
        x, y, width, height = prediction['x'], prediction['y'], prediction['width'], prediction['height']
        if prediction['class_name'] in exclude_class:
            continue
        
        if prediction['class_name'] == 'not':
            x_copy, y_copy, width_copy, height_copy = x, y, width, height 

            while (True):
                if np.all(image[y_copy + height_copy, x_copy-1] == 255):
                    end_points.append({'object_id': prediction['object_id'], 'type': prediction['class_name'], 'input1': (x_copy - 1, y_copy + height_copy + 1), 'input2': None})
                    break
                else:
                    y_copy -= 1
                    
        elif prediction['class_name'] == 'output':
            x_copy, y_copy, width_copy, height_copy = x, y, width, height 

            while (True):
                if np.all(image[y_copy + height_copy, x_copy-1] == 255):
                    end_points.append({'object_id': prediction['object_id'], 'type': prediction['class_name'], 'label': prediction['label'], 'input1': (x_copy - 1, y_copy + height_copy + 1), 'input2': None})
                    break
                else:
                    y_copy -= 1

        else:
            x_copy, y_copy, width_copy, height_copy = x, y, width, height 

            while (True):
                if y_copy == 0 :
                    break
                if np.all(image[y_copy + height_copy, x_copy-1] == 255):
                    end_points.append({'object_id': prediction['object_id'], 'type': prediction['class_name'], 'input1': None, 'input2': (x_copy - 1, y_copy + height_copy + 1)})
                    break
                else:
                    y_copy -= 1

            while (True):
                if np.all(image[y_copy + height_copy, x_copy-1] == 0):
                    break
                else:
                    y_copy -= 1

            while (True):
                if y_copy == 0: 
                    break
                if np.all(image[y_copy + height_copy, x_copy-1] == 255):
                    end_points[-1]['input1'] = (x_copy - 1, y_copy + height_copy + 1)
                    break
                else:
                    y_copy -= 1

    return end_points

def get_startpoints(image, data):
    start_points = []
    exclude_class = ['junction', 'intersection', 'output']

    for prediction in data:
        x, y, width, height = prediction['x'], prediction['y'], prediction['width'], prediction['height']

        if prediction['class_name'] in exclude_class:
            continue

        if prediction['class_name'] == 'input':
            x_copy, y_copy, width_copy, height_copy = x, y, width, height 
            while True:
                if np.all(image[y_copy + height_copy + 1, x_copy + 10] == 255):
                    start_points.append({'object_id': prediction['object_id'], 'type': prediction['class_name'], 'label': prediction['label'], 'output': (x_copy, y_copy + height_copy)})
                    # cv.circle(image, (x_copy, y_copy + height_copy), 1, (0, 0, 255), -1)
                    break

                x_copy += 1

        else:
            x_copy, y_copy, width_copy, height_copy = x, y, width, height 
            while True:
                if np.all(image[y_copy + height_copy, x_copy+ width_copy +1] == 255):
                    start_points.append({'object_id': prediction['object_id'], 'type': prediction['class_name'], 'output': (x_copy + width_copy, y_copy + height_copy)})
                    break

                y_copy -= 1

    return start_points


def get_boolean_function(data):
    input_types = []
    expression_mapping = {}

    for value in data:
        
        component = {
            'object_id': value['to']['object_id'],
            'type': value['to']['type'],
        }
        if value['to']['type'] == 'junction': continue

        existing_component = next((obj for obj in input_types if obj['object_id'] == component['object_id']), None)

        if existing_component:
            if value['to']['pin'] == 'input1':
                existing_component['input1'] = value['from']['label'] if value['from']['type'] == 'input' else value['from']['object_id']
            elif value['to']['pin'] == 'input2':
                existing_component['input2'] = value['from']['label'] if value['from']['type'] == 'input' else value['from']['object_id']
        else:
            if value['to']['pin'] == 'input1':
                component['input1'] = value['from']['label'] if value['from']['type'] == 'input' else value['from']['object_id']
            elif value['to']['pin'] == 'input2':
                component['input2'] = value['from']['label'] if value['from']['type'] == 'input' else value['from']['object_id']
            
            input_types.append(component)
    
    def get_expression(component):
        if component['type'] == 'not':
            return f"Not({component['input1']})"
        elif component['type'] == 'and':
            return f"And({component['input1']},{component['input2']})"
        elif component['type'] == 'or':
            return f"Or({component['input1']},{component['input2']})"
        elif component['type'] == 'nand':
            return f"Nand({component['input1']}, {component['input2']})"
        elif component['type'] == 'nor':
            return f"Nor({component['input1']}, {component['input2']})"
        elif component['type'] == 'xnor':
            return f"Xnor({component['input1']}, {component['input2']})"
        elif component['type'] == 'xor':
            return f"Xor({component['input1']}, {component['input2']})"
        elif component['type'] == 'output':
            return f"{component['input1']}"
    
    for component in input_types:
        expression_mapping[component['object_id']] = get_expression(component)
    
    def resolve_expression(mapping, signal, visited=None):
        """Recursively resolve the boolean expression for a given signal."""
        if visited is None:
            visited = set()

        if signal.startswith('X') or signal not in mapping:
            return signal

        if signal in visited:
            return mapping[signal]

        visited.add(signal)

        expression = mapping[signal]
        resolved_expression = ""
        i = 0
        while i < len(expression):
            if expression[i].isalpha():  # If the character is alphabetic, it's part of a signal name
                j = i
                while j < len(expression) and (expression[j].isalnum() or expression[j] == '_'):
                    j += 1
                part = expression[i:j]
                if part in mapping:
                    resolved_expression += resolve_expression(mapping, part, visited)
                else:
                    resolved_expression += part
                i = j
            else:
                resolved_expression += expression[i]
                i += 1
        
        return resolved_expression

    def get_final_expressions(mapping):
        """Get the final boolean expressions for each output in the mapping."""
        final_expressions = {}
        for key in mapping:
            if key.startswith('OUT'):
                final_expressions[key] = resolve_expression(mapping, key)
        return final_expressions
            
    mapped_data = get_final_expressions(expression_mapping)    
    return mapped_data