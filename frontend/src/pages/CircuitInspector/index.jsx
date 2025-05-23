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
  const [loadingThreshold, setLoadingThreshold] = useState(false);
  const [currentCircuitData, setCurrentCircuitData] = useState({});
  const [currentPredictions, setCurrentPredictions] = useState([]);
  const [filteredImgUrl, setFilteredImgUrl] = useState('');
  const [loading, setLoading] = useState(false); 
  const [isVisibilityToggled, setIsVisibilityToggled] = useState(true); 
  const [confidence, setConfidence] = useState(50);
  const { task, loading: taskLoading, getTask} = useGetTask(taskId);
  const files = useRecoilValue(FilesAtom);
  const [gradedFilesCount, setGradedFilesCount] = useState(0)
  const {toastSuccess, toastError} = useToast()

  const [fileIndex, setFileIndex] = useState(() => {
    const storedId = sessionStorage.getItem("fileId");
    return storedId
      ? Math.max(0, files.findIndex(file => file.id === JSON.parse(storedId)))
      : 0;
  });

  const handleApplyThreshold = async (thresholdValue, mode = 'single') => {
    setLoadingThreshold(true);
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
      toastSuccess("Filter applied successfully.")
    } catch (error) {
      // toastError("An error occured. Check the console for more info.")
      console.error('Error applying threshold:', error);
    } finally{
      setLoadingThreshold(false)
    }
  };

  const handleDetectLogicGates = async (mode) => {
    setLoading(true); 
    try {
      const response  = await axios.post(`/detect-gates/process-detection/${currentFile.id}`, 
        {mode:mode},
        {headers: { "Content-Type": "application/json" } } 
      );
      setCurrentPredictions(response.data.predictions);
      setCurrentCircuitData({...currentCircuitData, predictions:response.data.predictions})
    } catch (error) {
      toastError("An error occured. Check the console for more info.")
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentFile = (file) => {
    const idx = files.findIndex(f => f.id === file.id);
    if (idx !== -1) {
      setFileIndex(idx);
      setCurrentFile(files[idx]);
    }
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
    } catch (error) {
      toastError(error?.response?.data?.error)
      console.error("Unable to process circuit", error?.response?.data.error)
    }finally{
      setLoading(false)
    }
  }

  const handleSetCurrentPredictions = (updatedPredictions) =>{
    setCurrentPredictions(updatedPredictions)
  }

  useEffect(()=>{
    if (!task){
      getTask(taskId)
    }
  }, [])

  useEffect(() => {
    if (files.length === 0) return;
    // If fileIndex is invalid, reset to 0
    let idx = fileIndex;
    if (idx < 0 || idx >= files.length) idx = 0;
    setFileIndex(idx);
    setCurrentFile(files[idx]);
    sessionStorage.removeItem("fileId");
  }, [files]);

  useEffect(() => {
    if (files.length === 0) return;
    let idx = fileIndex;
    if (idx < 0 || idx >= files.length) idx = 0;
    setCurrentFile(files[idx]);
  }, [fileIndex, files]);

  useEffect(() => {
    const getCircuitData = async () => {
      if (currentFile?.id) {
        // setLoading(true); // Set loading to true when fetching data
        try {
          const response = await axios.get(`/detect-gates/get-circuit-data/${currentFile?.id}`);
          setCurrentCircuitData(response.data.circuit_analysis);
          setCurrentPredictions(response.data.circuit_analysis.predictions);
          handleApplyThreshold(response.data.circuit_analysis.threshold_value);
          const gradedCount = files.filter((file) => file.graded).length;
          setGradedFilesCount(gradedCount); 
          // setFileIndex(files[files.indexOf(currentFile)])
        } catch (error) {
          console.error(error.message);
        } 
      }
    };
    getCircuitData();
  }, [currentFile?.id,]);

  const handleGradeUpdate = (fileId, newGrade) => {
    const updatedFiles = files.map((file) =>
      file.id === fileId ? { ...file, graded: newGrade } : file
    );
  
    const gradedCount = updatedFiles.filter((file) => file.graded).length;
    setGradedFilesCount(() => gradedCount); 
  };

  const handleSliderChange = (value) => {
    setConfidence(value);
  };


  if (!task && taskLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="mt-4 text-2xl font-bold text-primaryColor animate-pulse">
          Loading...
        </div>
        <div className="mt-2 flex space-x-2">
          <div className="w-3 h-3 bg-primaryColor rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-primaryColor rounded-full animate-bounce delay-150"></div>
          <div className="w-3 h-3 bg-primaryColor rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[#eeeded] flex flex-col text  h-screen">
      <header className="bg-[#333]">
        <Header task={task} files={files} onCurrentFileChange={handleCurrentFile} gradedFilesCount={gradedFilesCount} fileIndex={fileIndex}/>
      </header>

      <main className="flex w-full h-full max-lg:flex-col">
        <div className="fixed left-5 top-1/2 transform -translate-y-1/2 z-50 max-lg:absolute">
          <LeftSidebar 
            circuitData={currentCircuitData} 
            onApplyThreshold={handleApplyThreshold} 
            onDetectLogicGates={handleDetectLogicGates}
            onTogglePredictionVisibility={handlePredictionVisibility}
            onAnalyzeCircuit={handleAnalyzeCircuit}
            loading={loading}
            loadingThreshold={loadingThreshold}
          />
        </div>

        <div className="fixed left-1/2 bottom-5  -translate-x-1/2 z-40">
          <ConfidenceSlider onChange={handleSliderChange} />
        </div>

        <div className="w-full h-full">
          <ImageDisplay img_url={filteredImgUrl} predictions={currentPredictions} isPredictionVisible={isVisibilityToggled} confidenceThreshold={confidence} onSetPredictions={handleSetCurrentPredictions} loadingThreshold={loadingThreshold}/>
        </div>

        <div className="w-[600px] h-full max-lg:w-full max-lg:border-t-2">
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
