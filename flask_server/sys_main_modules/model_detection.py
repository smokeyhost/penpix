import time
from pathlib import Path
import uuid

import cv2
import torch
import torch.backends.cudnn as cudnn
from numpy import random
import numpy as np
import os

from sys_main_modules.models.experimental import attempt_load
from sys_main_modules.utilities.datasets import LoadStreams, LoadImages
from sys_main_modules.utilities.general import check_img_size, check_requirements, check_imshow, non_max_suppression, apply_classifier, \
    scale_coords, xyxy2xywh, strip_optimizer, set_logging, increment_path
from sys_main_modules.utilities.plots import plot_one_box
from sys_main_modules.utilities.torch_utils import select_device, load_classifier, time_synchronized, TracedModel

import onnxruntime as ort


def detect(weights='yolov7.pt', source='inference/images', img_size=640, conf_thres=0.25, iou_thres=0.45, device='', view_img=False, save_txt=False, save_conf=False, nosave=False, classes=None, agnostic_nms=False, augment=False, update=False, project='runs/', name='exp', exist_ok=False, save_trace=False, save_img=False):

    source, weights, view_img, save_txt, imgsz = source, weights, view_img, save_txt, img_size 
    save_img = not nosave and not source.endswith('.txt')  # save inference images
    webcam = source.isnumeric() or source.endswith('.txt') or source.lower().startswith(
        ('rtsp://', 'rtmp://', 'http://', 'https://'))

    # Directories
    save_dir = Path(increment_path(Path(project) / name, exist_ok=exist_ok))  # increment run
    (save_dir / 'labels' if save_txt else save_dir).mkdir(parents=True, exist_ok=True)  # make dir

    # Initialize
    set_logging()
    device = select_device(device)
    half = device.type != 'cpu'  # half precision only supported on CUDA
    
    model = attempt_load(weights, map_location=device)  # load FP32 model\
    stride = int(model.stride.max())  # model stride
    imgsz = check_img_size(imgsz, s=stride)  # check img_size
    
    if save_trace:
        model = TracedModel(model, device, imgsz=imgsz)
    if half:
        model.half()  # to FP16

    # Second-stage classifier
    classify = False
    if classify:
        modelc = load_classifier(name='resnet101', n=2)  # initialize
        modelc.load_state_dict(torch.load('weights/resnet101.pt', map_location=device)['model']).to(device).eval()

    # Set Dataloader
    vid_path, vid_writer = None, None
    if webcam:
        view_img = check_imshow()
        cudnn.benchmark = True  # set True to speed up constant image size inference
        dataset = LoadStreams(source, img_size=imgsz, stride=stride)
    else:
        dataset = LoadImages(source, img_size=imgsz, stride=stride)

    # Get names and colors
    names = model.module.names if hasattr(model, 'module') else model.names
    colors = [[random.randint(0, 255) for _ in range(3)] for _ in names]

    # Run inference
    if device.type != 'cpu':
        model(torch.zeros(1, 3, imgsz, imgsz).to(device).type_as(next(model.parameters())))  # run once
    old_img_w = old_img_h = imgsz
    old_img_b = 1

    t0 = time.time()
    for path, img, im0s, vid_cap in dataset:
        img = torch.from_numpy(img).to(device)
        img = img.half() if half else img.float()  # uint8 to fp16/32
        img /= 255.0  # 0 - 255 to 0.0 - 1.0
        if img.ndimension() == 3:
            img = img.unsqueeze(0)

        # Warmup
        if device.type != 'cpu' and (old_img_b != img.shape[0] or old_img_h != img.shape[2] or old_img_w != img.shape[3]):
            old_img_b = img.shape[0]
            old_img_h = img.shape[2]
            old_img_w = img.shape[3]
            for i in range(3):
                model(img, augment=augment)[0]

        # Inference
        t1 = time_synchronized()
        with torch.no_grad():   # Calculating gradients would cause a GPU memory leak
            pred = model(img, augment=augment)[0]
        t2 = time_synchronized()

        # Apply NMS
        pred = non_max_suppression(pred, conf_thres, iou_thres, classes=classes, agnostic=agnostic_nms)
        t3 = time_synchronized()

        # Apply Classifier
        if classify:
            pred = apply_classifier(pred, modelc, img, im0s)

        predictions = []
        # Process detections
        for i, det in enumerate(pred):  # detections per image
            if webcam:  # batch_size >= 1
                p, s, im0, frame = path[i], '%g: ' % i, im0s[i].copy(), dataset.count
            else:
                p, s, im0, frame = path, '', im0s, getattr(dataset, 'frame', 0)

            p = Path(p)  # to Path
            save_path = str(save_dir / p.name)  # img.jpg
            txt_path = str(save_dir / 'labels' / p.stem) + ('' if dataset.mode == 'image' else f'_{frame}')  # img.txt
            gn = torch.tensor(im0.shape)[[1, 0, 1, 0]]  # normalization gain whwh
            if len(det):
                # Rescale boxes from img_size to im0 size
                det[:, :4] = scale_coords(img.shape[2:], det[:, :4], im0.shape).round()

                # Print results
                for c in det[:, -1].unique():
                    n = (det[:, -1] == c).sum()  # detections per class
                    s += f"{n} {names[int(c)]}{'s' * (n > 1)}, "  # add to string

                # Write results
                for *xyxy, conf, cls in reversed(det):
                    xywh = (xyxy2xywh(torch.tensor(xyxy).view(1, 4)) / gn).view(-1).tolist()  # normalized xywh
                    line = (cls, *xywh, conf) if save_conf else (cls, *xywh)  # label format
                    # Convert bounding box format (xyxy) to (x, y, width, height)
                    x_min, y_min, x_max, y_max = map(int, xyxy)
                    width = x_max - x_min
                    height = y_max - y_min
                    # Create a dictionary for each detection
                    detection = {
                        "x": x_min,
                        "y": y_min,
                        "width": width,
                        "height": height,
                        "confidence": conf.item(),  # Convert tensor to float
                        "class": names[int(cls)],  # Get class name
                        "class_id": int(cls),
                        "detection_id": str(uuid.uuid4())  # Generate unique detection ID
                    }
                    predictions.append(detection)

                    if save_txt:  # Write to file
                        with open(txt_path + '.txt', 'a') as f:
                            f.write(('%g ' * len(line)).rstrip() % line + '\n')

                    if save_img or view_img:  # Add bbox to image
                        label = f'{names[int(cls)]} {conf:.2f}'
                        plot_one_box(xyxy, im0, label=label, color=colors[int(cls)], line_thickness=1)

            # Print time (inference + NMS)
            print(f'{s}Done. ({(1E3 * (t2 - t1)):.1f}ms) Inference, ({(1E3 * (t3 - t2)):.1f}ms) NMS')

            # Stream results
            if view_img:
                cv2.imshow(str(p), im0)
                cv2.waitKey(1)  # 1 millisecond

            # Save results (image with detections)
            if save_img:
                if dataset.mode == 'image':
                    # cv2.imwrite(save_path, im0)
                    print(f" The image with the result is saved in: {save_path}")
                else:  # 'video' or 'stream'
                    if vid_path != save_path:  # new video
                        vid_path = save_path
                        if isinstance(vid_writer, cv2.VideoWriter):
                            vid_writer.release()  # release previous video writer
                        if vid_cap:  # video
                            fps = vid_cap.get(cv2.CAP_PROP_FPS)
                            w = int(vid_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                            h = int(vid_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                        else:  # stream
                            fps, w, h = 30, im0.shape[1], im0.shape[0]
                            save_path += '.mp4'
                        vid_writer = cv2.VideoWriter(save_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (w, h))
                    vid_writer.write(im0)

    if save_txt or save_img:
        s = f"\n{len(list(save_dir.glob('labels/*.txt')))} labels saved to {save_dir / 'labels'}" if save_txt else ''
        print(f"Results saved to {save_dir}{s}")

    print(f'Done. ({time.time() - t0:.3f}s)')

    return predictions

def detect_objects(img_path, model, device, img_size=640):
    try:
        start_time = time.time()
        stride = int(model.stride.max())
        imgsz = check_img_size(img_size, s=stride)

        try:
            dataset = LoadImages(img_path, img_size=imgsz, stride=stride)
        except Exception as e:
            raise ValueError(f"Error loading image: {str(e)}")

        names = model.module.names if hasattr(model, 'module') else model.names
        predictions = []

        for path, img, im0s, vid_cap in dataset:
            try:
                img = torch.from_numpy(img).to(device)
                img = img.float() / 255.0  # Normalize
                if img.ndimension() == 3:
                    img = img.unsqueeze(0)

                with torch.no_grad():
                    pred = model(img)
                    if isinstance(pred, tuple):
                        pred = pred[0]
                
                pred = non_max_suppression(pred, 0.25, 0.45)

                for i, det in enumerate(pred):
                    p = Path(path)
                    if im0s is None:
                        raise ValueError("Original image (im0s) is None. Check the input image format.")
                    
                    gn = torch.tensor(im0s.shape)[[1, 0, 1, 0]]
                    if len(det):
                        det[:, :4] = scale_coords(img.shape[2:], det[:, :4], im0s.shape).round()

                        for *xyxy, conf, cls in reversed(det):
                            x_min, y_min, x_max, y_max = map(int, xyxy)
                            width = x_max - x_min
                            height = y_max - y_min
                            
                            detection = {
                                "x": x_min,
                                "y": y_min,
                                "width": width,
                                "height": height,
                                "confidence": conf.item(),
                                "class": names[int(cls)],
                                "class_id": int(cls),
                                "detection_id": str(uuid.uuid4())
                            }
                            predictions.append(detection)

            except Exception as e:
                print(f"Error processing {path}: {str(e)}")
                continue 
        
        end_time = time.time();
        elapsed_time = end_time - start_time
        print(f"Detection time: {elapsed_time:.4f} seconds")
        
        return predictions

    except Exception as e:
        print(f"Critical error in detection: {str(e)}")
        return []


def detect_objects_onnx(img_path, session, img_size=640, conf_threshold=0.25):
    try:
        start_time = time.time()
        CLASS_NAMES = ['and', 'input', 'intersection', 'junction', 'nand', 'nor', 'not', 'or', 'output', 'xnor', 'xor']

        img = cv2.imread(img_path)
        if img is None:
            raise ValueError(f"Error loading image: {img_path}") 
        
        H, W, _ = img.shape  # Original image size
        img_resized = cv2.resize(img, (img_size, img_size))
        img_input = img_resized.astype(np.float32) / 255.0  # Normalize
        img_input = img_input.transpose(2, 0, 1)  # Change to (C, H, W)
        img_input = np.expand_dims(img_input, axis=0)  # Add batch dimension

        # Run inference
        input_name = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name
        output = session.run([output_name], {input_name: img_input})
        
        predictions = output[0][0]
        
        predictions_list = []
        for det in predictions:
            x_center, y_center, width, height, confidence, *class_probs = det  
            if confidence > conf_threshold:
                class_id = int(np.argmax(class_probs))
                
                x1 = int((x_center - width / 2) * W / img_size)
                y1 = int((y_center - height / 2) * H / img_size)
                x2 = int((x_center + width / 2) * W / img_size)
                y2 = int((y_center + height / 2) * H / img_size)
                
                detection = {
                    "x": x1,
                    "y": y1,
                    "width": x2 - x1,
                    "height": y2 - y1,
                    "confidence": float(confidence),
                    "class": CLASS_NAMES[class_id],
                    "class_id": class_id,
                    "detection_id": str(uuid.uuid4())
                }
                predictions_list.append(detection)
        
        end_time = time.time();
        elapsed_time = end_time - start_time
        print(f"Detection time: {elapsed_time:.4f} seconds")
        
        return predictions_list
    
    except Exception as e:
        print(f"Error in detection: {str(e)}")
        return []