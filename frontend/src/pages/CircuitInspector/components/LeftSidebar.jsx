import {
  FaSliders,
  // FaTable,
  FaEye,
  FaEyeSlash,
  // FaFileExport,
} from "react-icons/fa6";
import { GiLogicGateNor } from "react-icons/gi";
import { PiCircuitryFill } from "react-icons/pi";
import { ImSpinner9 } from "react-icons/im";
import SetThresholdSlider from "./SetThresholdSlider";
import DetectLogicGatesOption from "./DetectLogicGatesOptions";
// import TruthTable from "./TruthTable";
import styles from "./styles/component.module.css";
import { useState, useEffect } from "react";

const LeftSidebar = ({
  loading,
  circuitData,
  onApplyThreshold,
  onDetectLogicGates,
  onTogglePredictionVisibility,
  onAnalyzeCircuit,
  onExportVerilog,
}) => {
  const [selectedTool, setSelectedTool] = useState("");
  const [isPredictionToggled, setIsPredictionToggled] = useState(false);
  const [disabledStates, setDisabledStates] = useState({
    analyzeCircuit: true,
    truthTable: true,
    exportVerilog: true,
  });

  useEffect(() => {
    const hasPredictions = circuitData?.predictions?.length > 0;
    const hasBooleanExpressions = circuitData?.boolean_expressions?.length > 0;
    
    setDisabledStates({
      analyzeCircuit: !hasPredictions,
      truthTable: !hasPredictions || !hasBooleanExpressions,
      exportVerilog: !hasPredictions || !hasBooleanExpressions,
    });
    // setSelectedTool("");
  }, [circuitData]);

  const handleToolClick = async (tool) => {
    if (!loading) {
      if (tool === "analyzeCircuit") {
        onAnalyzeCircuit();
      } else if (tool === "exportVerilog") {
        onExportVerilog();
      }
    }
    setSelectedTool((prevSelectedTool) => (prevSelectedTool === tool ? "" : tool));
  };

  const handleTogglePredictions = () => {
    if (!loading) {
      setIsPredictionToggled((prevState) => !prevState);
      onTogglePredictionVisibility();
    }
  };

  const handleApplyThreshold = (thresholdValue, mode) => {
    if (!loading) {
      onApplyThreshold(thresholdValue, mode);
    }
  };

  // const handleCloseTable = () =>{
  //   setSelectedTool("")
  // }

  return (
    <div
      className={`w-[95px] max-sm:w-[60px] h-full flex items-center flex-col gap-4  bg-gray-800 bg-opacity-85 border border-borderGray font-sans text-customBlack1 py-3 px-3 relative select-none rounded-2xl ${
        loading ? styles.disabled : ""
      }`}
    >
      <div
        className={`${styles.tool} ${
          selectedTool === "threshold"
            ? "bg-gray-600 text-white"
            : "hover:bg-gray-200 hover:text-gray-800"
        } ${loading && selectedTool !== "threshold" ? "hover:bg-transparent" : ""}`}
        onClick={() => handleToolClick("threshold")}
      >
        {loading && selectedTool === "threshold" ? (
          <ImSpinner9 size={20} className="animate-spin" />
        ) : (
          <FaSliders size={20} />
        )}
        <h3 className={`${styles.tool_label} text-xs max-sm:hidden`}>Set Threshold</h3>
      </div>

      <div
        className={`${styles.tool} ${
          selectedTool === "logicGates"
            ? "bg-gray-600 text-white"
            : "hover:bg-gray-200 hover:text-gray-800"
        } ${loading && selectedTool !== "logicGates" ? "hover:bg-transparent" : ""}`}
        onClick={() => handleToolClick("logicGates")}
      >
        {loading && selectedTool === "logicGates" ? (
          <ImSpinner9 size={30} className="animate-spin" />
        ) : (
          <GiLogicGateNor size={30} />
        )}
        <h3 className={`${styles.tool_label} text-xs max-sm:hidden`}>Logic Gates</h3>
      </div>

      <div
        className={`${styles.tool} ${
          isPredictionToggled
            ? "bg-gray-600 text-white"
            : "hover:bg-gray-200 hover:text-gray-800"
        } ${loading ? "hover:bg-transparent" : ""}`}
        onClick={handleTogglePredictions}
      >
        {isPredictionToggled ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        <h3 className={`${styles.tool_label} text-xs max-sm:hidden`}>Toggle Predictions</h3>
      </div>

      <div
        className={`${styles.tool} ${
          disabledStates.analyzeCircuit
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-200 hover:text-gray-800"
        }`}
        onClick={() =>
          !disabledStates.analyzeCircuit && handleToolClick("analyzeCircuit")
        }
      >
        {loading && selectedTool === "analyzeCircuit" ? (
          <ImSpinner9 size={25} className="animate-spin" />
        ) : (
          <PiCircuitryFill size={25} />
        )}
        <h3 className={`${styles.tool_label} text-xs max-sm:hidden`}>Analyze Circuit</h3>
      </div>

      {/* <div
        className={`${styles.tool} ${
          selectedTool === "truthTable"
            ? "bg-gray-600 text-white"
            : "hover:bg-gray-200 hover:text-gray-800"
        } ${disabledStates.truthTable ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() =>
          !disabledStates.truthTable && handleToolClick("truthTable")
        }
      >
        <FaTable size={20} />
        <h3 className={`${styles.tool_label} text-xs`}>Truth Table</h3>
      </div> */}

      {/* <div
        className={`${styles.tool} ${
          disabledStates.exportVerilog
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-200 hover:text-gray-800"
        }`}
        onClick={() =>
          !disabledStates.exportVerilog && handleToolClick("exportVerilog")
        }
      >
        <FaFileExport size={20} />
        <h3 className={`${styles.tool_label} text-xs`}>Export Netlist</h3>
      </div> */}

      {selectedTool === "threshold" && (
        <div className="absolute -right-64">
          <SetThresholdSlider
            onApplyThreshold={handleApplyThreshold}
            value={circuitData.threshold_value}
          />
        </div>
      )}

      {selectedTool === "logicGates" && (
        <div className="absolute -right-64 top-28">
          <DetectLogicGatesOption
            onDetectLogicGates={onDetectLogicGates}
            loading={loading}
          />
        </div>
      )}

      {/* {selectedTool === "truthTable" && (
        <div className="absolute -right-64 top-48">
          <TruthTable data={circuitData.truth_table} onClose={handleCloseTable}/>
        </div>
      )} */}
    </div>
  );
};

export default LeftSidebar;
