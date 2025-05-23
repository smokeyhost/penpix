import CompareTruthTable from "./CompareTruthTable";
import PreviewNetlist from "./PreviewNetlist";
import UnifiedComponent from "./UnifiedComponent";
import { FaTableColumns } from "react-icons/fa6";
import { GiCircuitry } from "react-icons/gi";
import { ImSpinner9 } from "react-icons/im";
import { MdOutlineGrading } from "react-icons/md";
import { useState, useEffect } from "react";
import axios from "axios";
import GradeTableModal from "./GradeTableModal";  

const RightSideBar = ({ task, file, circuitData, onGradeUpdate }) => {
  const [showCompareTable, setShowCompareTable] = useState(false);
  const [loadingGrade, setLoadingGrade] = useState(false);
  const [expressions, setExpressions] = useState([]);
  const [answerTable, setAnswerTable] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [netlistContent, setNetlistContent] = useState('');
  const [showGradeModal, setShowGradeModal] = useState(false);  
  const [gradeResults, setGradeResults] = useState([]);  
  const [hasAnswerKeys, setAnswerKeys] = useState([])

  useEffect(()=>{
    setAnswerKeys(task?.answer_keys?.length > 0)
  }, [task])

  const relevantAnswerKey = hasAnswerKeys
    ? task.answer_keys.find((key) => key.item === `Item ${file?.item_number}`)
    : null;

  useEffect(() => {
    if (relevantAnswerKey && relevantAnswerKey.keys) {
      const extractedExpressions = relevantAnswerKey.keys.map(key => key.expression);
      setExpressions(extractedExpressions);
    }
  }, [relevantAnswerKey]);

  useEffect(() => {
    const getAnswerTruthTable = async () => {
      try {
        const response = await axios.post('detect-gates/generate-truth-table', { expressions });
        setAnswerTable(response.data.truth_table);
      } catch (error) {
        console.error(error.message);
      }
    };
    getAnswerTruthTable();
  }, [expressions]);

  const handleGenerateNetlist = async () => {
    try {
      const response = await axios.get(`/detect-gates/generate-netlist/${file.id}`);
      const netlist = await response.data; 
      setNetlistContent(netlist);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Error generating netlist:", error.message);
    }
  };

  const handleDownloadNetlist = () => {
    const blob = new Blob([netlistContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `circuit_${file.id}.asc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateGrade = async (fileId, totalGrade) => {
    setLoadingGrade(true);
    try {
      const response = await axios.put(`/files/update-grade/${fileId}`, { total_grade: totalGrade });
  
      if (response.status === 200) {
        onGradeUpdate(fileId, true);
      } else {
        console.error("Failed to update grade:", response.data);
      }
    } catch (error) {
      console.error("Error updating grade:", error.message);
    } finally{
      setLoadingGrade(false)
    }
  };

  const handleGradeSubmission = async () => {
    if (!answerTable || !circuitData.truth_table) {
      console.error("Missing data for comparison.");
      return;
    }
  
    if (!relevantAnswerKey || !relevantAnswerKey.keys) {
      console.error("No relevant answer key found.");
      return;
    }
  
    const detailedResults = [];
  
    Object.entries(answerTable).forEach(([_ , tableRow], index) => {
      let isMatch = false;
      let matchedKey = null;
  
      Object.entries(circuitData.truth_table).forEach(([truthKey, truthRow]) => {
        if (JSON.stringify(tableRow) === JSON.stringify(truthRow)) {
          isMatch = true;
          matchedKey = truthKey;
        }
      });
  
      if (isMatch) {
        const grade = relevantAnswerKey.keys[index]?.grade || 0;
  
        detailedResults.push({
          Output: `OUT ${index + 1}`,
          Expression: relevantAnswerKey.keys[index]?.expression || "Unknown Expression",
          Grade: Number(grade),
          Result: "Match",
          MatchedKey: matchedKey,
        });
      } else {
        detailedResults.push({
          Output: `OUT ${index + 1}`,
          Expression: relevantAnswerKey.keys[index]?.expression || "Unknown Expression",
          Grade: 0,
          Result: "Mismatch",
        });
      }
    });
  
    Object.entries(circuitData.truth_table).forEach(([_ , truthRow], index) => {
      const isMissing = !Object.entries(answerTable).some(([_ , tableRow]) => JSON.stringify(tableRow) === JSON.stringify(truthRow));
  
      if (isMissing) {
        detailedResults.push({
          Output: `OUT ${index + 1}`,
          Expression: relevantAnswerKey.keys[index]?.expression || "Unknown Expression",
          Grade: 0,
          Result: "Missing in Submitted Table",
        });
      }
    });
  
    const totalGrade = detailedResults.reduce((sum, result) => sum + result.Grade, 0);
  
    if (detailedResults.length > 0) {
      setGradeResults(detailedResults);
      await updateGrade(file.id, totalGrade);
    } else {
      console.error("No detailed results generated for grading.");
    }
  
    setShowGradeModal(true);
  };

  const handleShowCompareTable = () => {
    setShowCompareTable(true); 
  };
  const handleCloseGradeModal = () => {
    setShowGradeModal(false);  
  };

  const handleCloseCompareTable = () => {
    setShowCompareTable(false); 
  };

  const handleClosePreviewNetlist = () =>{
    setIsPreviewOpen(false)
  }

  return (
    <div className="bg-white flex flex-col gap-6 relative border-l border-gray-300 w-full h-full p-6 text-gray-700">
      <div className="text-center mb-2">
        <h1 className="text-xl font-bold text-gray-800 max-sm:text-lg">Assessment Tools</h1>
        <p className="text-sm text-gray-500 max-sm:text-xs">
          Use the tools below to assess and analyze the circuit data.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div
          className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition"
          onClick={handleShowCompareTable}
        >
          <FaTableColumns size={40} className="text-blue-500 mb-2" />
          <span className="font-semibold text-gray-700 text-center text-sm max-sm:text-xs">Compare Tables</span>
        </div>

        <div
          className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition"
          onClick={handleGenerateNetlist}
        >
          <GiCircuitry size={40} className="text-green-500 mb-2" />
          <span className="font-semibold text-gray-700 text-center text-sm max-sm:text-xs">Preview Netlist</span>
        </div>

        <div
          className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition"
          onClick={handleGradeSubmission}
        >
          {!loadingGrade ? <MdOutlineGrading size={40} className="text-yellow-500 mb-2" /> : <ImSpinner9 size={40} className="animate-spin" /> }
          <span className="font-semibold text-gray-700 text-center text-sm max-sm:text-xs">Grade Submission</span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
      <UnifiedComponent
          relevantAnswerKey={task?.answer_keys?.find(
            (key) => key.item === `Item ${file?.item_number}`
          )}
          circuitData={circuitData}
        />
      </div>

      {showCompareTable && (
        <CompareTruthTable
          answerTable={answerTable}
          circuitTruthTable={circuitData.truth_table}
          onClose={handleCloseCompareTable}
        />
      )}

      {showGradeModal && (
        <GradeTableModal results={gradeResults} onClose={handleCloseGradeModal} />
      )}

      {isPreviewOpen && (
        <PreviewNetlist
          netlistContent={netlistContent}
          onDownload={handleDownloadNetlist}
          onClose={handleClosePreviewNetlist}
        />
      )}
    </div>
  );
};

export default RightSideBar;
