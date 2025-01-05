import Header from "./components/Header";
import LeftSidebar from "./components/LeftSidebar";
import RightSideBar from "./components/RightSideBar";
import ImageDisplay from "./components/ImageDisplay";
import ConfidenceSlider from './components/ConfidenceSlider';
import { useParams } from "react-router-dom";
import useGetTask from '../../hooks/useGetTask';
import { useEffect, useState } from "react";
import { FilesAtom } from "../../atoms/FilesAtom";
import useToast from "../../hooks/useToast";
import { useRecoilValue } from "recoil";
import axios from "axios";

const CircuitInspectorPage = () => {
  const { taskId} = useParams(); 
  const [currentFile, setCurrentFile] = useState({});
  const [currentCircuitData, setCurrentCircuitData] = useState({});
  const [currentPredictions, setCurrentPredictions] = useState([]);
  const [filteredImgUrl, setFilteredImgUrl] = useState('');
  const [loading, setLoading] = useState(false); 
  const [isVisibilityToggled, setIsVisibilityToggled] = useState(true); 
  const [confidence, setConfidence] = useState(50);
  const { task, loading: taskLoading} = useGetTask(taskId);
  const files = useRecoilValue(FilesAtom);
  const [gradedFilesCount, setGradedFilesCount] = useState(0)
  const {toastSuccess, toastError} = useToast()

  const [fileIndex, setFileIndex] = useState(() => {
    const storedIndex = localStorage.getItem("fileIndex");
    return storedIndex ? JSON.parse(storedIndex) : 0;
  });


  const handleApplyThreshold = async (thresholdValue, mode = 'single') => {
    console.log(currentFile?.id)
    try {
      const response = await axios.post('/detect-gates/set-filter-threshold', {
        thresholdValue,
        mode,
        fileId: currentFile?.id,
      }, { responseType: 'blob' });

      const imageUrl = URL.createObjectURL(response.data);
      setFilteredImgUrl(imageUrl);
      setCurrentCircuitData((prev) => ({
        ...prev,
        threshold_value: thresholdValue,
      }));
    } catch (error) {
      console.error('Error applying threshold:', error);
    } 
  };

  const handleDetectLogicGates = async (mode) => {
    setLoading(true); 
    try {
      const response  = await axios.post(`/detect-gates/process-detection/${currentFile.id}`, {
        mode
      });
      setCurrentPredictions(response.data.predictions);
      setCurrentCircuitData({...currentCircuitData, predictions:response.data.predictions})
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentFile = (file) => {
    setCurrentFile(file);
  };

  const handlePredictionVisibility = () => {
    setIsVisibilityToggled(!isVisibilityToggled)
  }

  const handleAnalyzeCircuit = async() => {
    setLoading(true)
    try {
      const response = await axios.post(`/detect-gates/analyze-circuit/${currentFile.id}`)
      setCurrentCircuitData({...currentCircuitData, boolean_expressions:response.data.boolean_expressions, truth_table: response.data.truth_table})

      toastSuccess("Circuit Analysis is Completed.")
      console.log("Boolean Expressions:", response.data)
    } catch (error) {
      toastError("Error in Analyzing the Circuit.")
      console.log(error)
    }finally{
      setLoading(false)
    }
  }

  const handleSetCurrentPredictions = (updatedPredictions) =>{
    setCurrentPredictions(updatedPredictions)
  }

  useEffect(() => {
    if (files.length > 0) {
      setCurrentFile(files[fileIndex]);
      localStorage.removeItem("fileIndex");
    }
  }, [files]);

  useEffect(() => {
    const getCircuitData = async () => {
      if (currentFile?.id) {
        // setLoading(true); // Set loading to true when fetching data
        try {
          const response = await axios.get(`/detect-gates/get-circuit-data/${currentFile.id}`);
          setCurrentCircuitData(response.data.circuit_analysis);
          setCurrentPredictions(response.data.circuit_analysis.predictions);
          handleApplyThreshold(response.data.circuit_analysis.threshold_value);

          const gradedCount = files.filter((file) => file.graded).length;
          setGradedFilesCount(gradedCount); 
          setFileIndex(files[files.indexOf(currentFile)])
          
          console.log("Circuit Data",response.data.circuit_analysis);
        } catch (error) {
          console.log(error.message);
        } 
      }
    };
    getCircuitData();
  }, [currentFile?.id]);

  const handleGradeUpdate = (fileId, newGrade) => {
    const updatedFiles = files.map((file) =>
      file.id === fileId ? { ...file, graded: newGrade } : file
    );
  
    const gradedCount = updatedFiles.filter((file) => file.graded).length;
    setGradedFilesCount(gradedCount); 
  };

  const handleSliderChange = (value) => {
    setConfidence(value);
  };


  if (taskLoading) return <div>Loading...</div>; 

  return (
    <div className="bg-[#eeeded] min-h-screen flex flex-col text">
      <header className="bg-[#333]">
        <Header task={task} files={files} onCurrentFileChange={handleCurrentFile} gradedFilesCount={gradedFilesCount} fileIndex={fileIndex}/>
      </header>

      <main className="flex w-full max-lg:flex-col">
        <div className="fixed left-5 top-1/2 transform -translate-y-1/2 z-50 max-lg:absolute">
          <LeftSidebar 
            circuitData={currentCircuitData} 
            onApplyThreshold={handleApplyThreshold} 
            onDetectLogicGates={handleDetectLogicGates}
            onTogglePredictionVisibility={handlePredictionVisibility}
            onAnalyzeCircuit={handleAnalyzeCircuit}
            loading={loading}
          />
        </div>

        <div className="fixed left-1/2 bottom-5  -translate-x-1/2">
          <ConfidenceSlider onChange={handleSliderChange} />
        </div>

        <div className="w-full ">
          <ImageDisplay img_url={filteredImgUrl} predictions={currentPredictions} isPredictionVisible={isVisibilityToggled} confidenceThreshold={confidence} onSetPredictions={handleSetCurrentPredictions}/>
        </div>

        <div className="w-full">
          <RightSideBar 
            circuitData={currentCircuitData}
            task={task}
            file={currentFile}
            onGradeUpdate={handleGradeUpdate} 
            />
        </div>
      </main>
    </div>
  );
};

export default CircuitInspectorPage;
