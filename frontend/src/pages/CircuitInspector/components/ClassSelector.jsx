import { useState, useEffect } from 'react';

const ClassSelector = ({ prediction, position, onClassChange, onRemoveClass, onCancel }) => {
  const options = [
    'input', 'output', 'intersection', 'junction', 
    'AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'
  ];

  const classColors = {
    'and': 'rgb(0, 0, 255)',      
    'input': 'rgb(0, 255, 0)',    
    'junction': 'rgb(255, 0, 0)', 
    'nand': 'rgb(0, 255, 255)',   
    'nor': 'rgb(255, 255, 0)',    
    'not': 'rgb(255, 0, 255)',    
    'or': 'rgb(128, 0, 128)',     
    'output': 'rgb(0, 128, 128)', 
    'xnor': 'rgb(128, 128, 0)',   
    'xor': 'rgb(148, 3, 252)',    
    'intersection': 'rgb(0, 128, 255)' 
  };

  const [selectedClass, setSelectedClass] = useState(prediction.class_name.toLowerCase());

  // Update the selectedClass when prediction changes
  useEffect(() => {
    setSelectedClass(prediction.class_name.toLowerCase());
  }, [prediction.class_name]);

  const handleSave = () => {
    onClassChange(selectedClass); 
    onCancel()
  };

  const handleSelectedOption = (option) => {
    setSelectedClass(option);
  };

  return (
    <div
      className="p-3 bg-gray-800 text-white rounded-lg shadow-md absolute w-[250px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxWidth: '250px',
        zIndex: '1000',
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      <h3 className="text-sm font-semibold mb-3">Select Class</h3>
      <div
        className="space-y-2"
        style={{
          maxHeight: '180px',  // Set the height of the scrollable area
          overflowY: 'auto',   // Enable vertical scrolling when content overflows
        }}
      >
        {options.map((className) => (
          <div
            key={className}
            className={`flex items-center cursor-pointer p-1 rounded-lg hover:bg-gray-700 transition ease-in-out duration-200 ${
              selectedClass === className.toLowerCase() ? 'font-bold text-blue-400' : ''
            }`}
            onClick={() => handleSelectedOption(className.toLowerCase())}
          >
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{
                backgroundColor: classColors[className.toLowerCase()] || 'gray',
              }}
            />
            <span className="capitalize text-xs">{className}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between gap-2">
        <button
          className="px-2 py-1 bg-gray-600 text-xs rounded-lg hover:bg-gray-500 transition ease-in-out duration-200 w-full"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="px-2 py-1 bg-red-500 text-xs text-white rounded-lg hover:bg-transparent border border-transparent hover:border-primaryColor transition ease-in-out duration-200 w-full"
          onClick={() => onRemoveClass(prediction.id)}
        >
          Remove
        </button>
        <button
          className="px-2 py-1 bg-primaryColor text-xs text-white rounded-lg hover:bg-transparent border border-transparent hover:border-primaryColor transition ease-in-out duration-200 w-full"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ClassSelector;
