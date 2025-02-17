import { useRef, useEffect, useState } from 'react';
import ClassSelector from './ClassSelector';
import { convertExpressionToUserFormat } from '../../../utils/helpers';
import { ImSpinner9 } from "react-icons/im";
import axios from 'axios';

const ImageDisplay = ({ img_url, predictions = [], isPredictionVisible, confidenceThreshold, onSetPredictions }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 950, height: 800 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startDrag, setStartDrag] = useState(null);
  const [isInside, setIsInside] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState({});
  const [position, setPosition] = useState(0);
  const [isClassSelectorOpen, setIsClassSelectorOpen] = useState(false);
  const [isUpdatedPrediction, setIsUpdatedPrediction] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [editing, setEditing] = useState(false) 

  useEffect(()=>{
    setImgLoading(true);
  },[img_url])

  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current) {
        setCanvasSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    resizeCanvas();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = img_url;
    // setImgLoading(true);

    img.onload = () => {
      setImgLoading(false);
      const drawImageAndPredictions = () => {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const imgAspectRatio = img.width / img.height;
        const canvasAspectRatio = canvasWidth / canvasHeight;

        let drawWidth, drawHeight;

        if (imgAspectRatio > canvasAspectRatio) {
          drawWidth = canvasWidth / scale;
          drawHeight = drawWidth / imgAspectRatio;
        } else {
          drawHeight = canvasHeight / scale;
          drawWidth = drawHeight * imgAspectRatio;
        }

        const x = (canvasWidth - drawWidth) / 2 + offset.x;
        const y = (canvasHeight - drawHeight) / 2 + offset.y;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, x, y, drawWidth, drawHeight);

        if (isPredictionVisible && predictions && predictions.length) {
          predictions.forEach((prediction) => {
            const { x: bx, y: by, width, height, class_name, confidence, color, object_id, label } = prediction;
            const scaledX = x + (bx * (drawWidth / img.width));
            const scaledY = y + (by * (drawHeight / img.height));
            const scaledWidth = width * (drawWidth / img.width);
            const scaledHeight = height * (drawHeight / img.height);

            if (confidence * 100 < confidenceThreshold) {
              ctx.strokeStyle = 'red'; // Use red for low-confidence boxes
              ctx.lineWidth = 3;
              ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

              ctx.beginPath();
              ctx.moveTo(scaledX, scaledY);
              ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight);
              ctx.moveTo(scaledX + scaledWidth, scaledY);
              ctx.lineTo(scaledX, scaledY + scaledHeight);
              ctx.stroke();
            } else {
              ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
              ctx.lineWidth = 2;
              ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
            }

            ctx.font = '12px Arial';
            ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            ctx.fillText(
              `${class_name} (${(confidence * 100).toFixed(1)}%)`,
              scaledX,
              scaledY - 5
            );

            // Add object_id at the bottom of the box
            if (class_name === 'input'){
              ctx.fillText(
                `${convertExpressionToUserFormat(label)}`,
                scaledX,
                scaledY + scaledHeight + 15
              );
            }else{
              ctx.fillText(
                `${object_id}`,
                scaledX,
                scaledY + scaledHeight + 15
              );
            }

            prediction.clickData = {
              scaledX,
              scaledY,
              scaledWidth,
              scaledHeight,
            };
          });
        }
      };

      drawImageAndPredictions();
    };

    const handleWheel = (e) => {
      if (isInside) {
        e.preventDefault();
        const newScale = Math.min(Math.max(scale * (1 - e.deltaY / 1000), 0.4), 5);
        setScale(newScale);
      }
    };

    canvas.addEventListener('click', handleCanvasClick);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [img_url, scale, offset, isInside, isPredictionVisible, confidenceThreshold, isUpdatedPrediction]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    const clickX = e.clientX - canvasRect.left;
    const clickY = e.clientY - canvasRect.top;

    predictions.forEach((prediction) => {
      const { clickData, confidence } = prediction;
      if (
        clickData &&
        confidence * 100 < confidenceThreshold &&
        clickX >= clickData.scaledX &&
        clickX <= clickData.scaledX + clickData.scaledWidth &&
        clickY >= clickData.scaledY &&
        clickY <= clickData.scaledY + clickData.scaledHeight
      ) {
        setSelectedPrediction(prediction);
        setPosition({
          top: e.clientY + 10,
          left: e.clientX + 10,
        });
        setIsClassSelectorOpen(true);
      }
    });
  };

  const handleMouseEnter = () => setIsInside(true);
  const handleMouseLeave = () => setIsInside(false);

  const handleMouseDown = (e) => {
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const startX = e.clientX - canvasRect.left;
    const startY = e.clientY - canvasRect.top;
    setStartDrag({ x: startX, y: startY });
  };

  const handleMouseMove = (e) => {
    if (startDrag) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const currentX = e.clientX - canvasRect.left;
      const currentY = e.clientY - canvasRect.top;
      const dx = currentX - startDrag.x;
      const dy = currentY - startDrag.y;
      setOffset((prevOffset) => ({
        x: prevOffset.x + dx,
        y: prevOffset.y + dy,
      }));
      setStartDrag({ x: currentX, y: currentY });
    }
  };

  const handleClassChange = async (selectedClass) => {
    try {
      if (!selectedPrediction || !selectedPrediction.id) {
        console.error("No prediction selected or missing ID");
        return;
      }
      setEditing(true)
      const response = await axios.put(`/detect-gates/edit-prediction/${selectedPrediction.circuit_analysis_id}`, {
        className: selectedClass,
        predictionId: selectedPrediction.id
      });

      if (response.status === 200) {
        onSetPredictions(response.data.filtered_predictions);
        setIsUpdatedPrediction(!isUpdatedPrediction);
        setIsClassSelectorOpen(false);
      } else {
        console.error("Failed to update class:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating class:", error.message);
    } finally{
      setEditing(false)
    }
  };

  const handleCloseClassSelector = () => {
    setIsClassSelectorOpen(false);
  };

  const handleRemoveClass = async (predictionId) => {
    try {
      setEditing(true)
      const response = await axios.delete(`detect-gates/delete-prediction/${predictionId}`);
      onSetPredictions(response.data.filtered_predictions);
      setIsUpdatedPrediction(!isUpdatedPrediction);
      setIsClassSelectorOpen(false);
    } catch (error) {
      console.error(error.message);
    } finally{
      setEditing(false);
    }
  };

  const handleMouseUp = () => setStartDrag(null);

  return (
    <div
      ref={containerRef}
      className={`image-canvas w-full h-full flex justify-center cursor-pointer  ${
        startDrag ? 'cursor-grab' : ''
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full h-full relative">
      <canvas ref={canvasRef} width={canvasSize.width}
          height={canvasSize.height} className="w-full h-full object-contain" />
      {imgLoading && (
        <div className="absolute inset-0 flex justify-center items-center flex-col gap-2">
          <ImSpinner9 className="animate-spin text-4xl text-black" />
          <p>Loading Image...</p>
        </div>
      )}
    </div>
      {isClassSelectorOpen && (
        <ClassSelector prediction={selectedPrediction} onClassChange={handleClassChange} position={position} onCancel={handleCloseClassSelector} 
        onRemoveClass={handleRemoveClass} editing={editing}/>
      )}
    </div>
  );
};

export default ImageDisplay;