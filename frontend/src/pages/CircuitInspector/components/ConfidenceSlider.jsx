import { useState } from 'react';
import ReactSlider from 'react-slider';

const ConfidenceSlider = ({ onChange}) => {
  const [confidence, setConfidence] = useState(70);

  const handleChange = (value) => {
    setConfidence(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className='bg-gray-800 p-4 rounded-lg w-[250px] gap-4 text-white bg-opacity-90'>
      <div className='flex items-center justify-center gap-5'>
        <h1 className='font-semibold text-xs'>Confidence Level:</h1>
        <ReactSlider
          className="w-full h-2 rounded-lg items-center flex cursor-pointer" 
          thumbClassName="w-5 h-5 bg-white rounded-full" 
          trackClassName="h-2 bg-primaryBg"
          min={0}  
          max={100} 
          onChange={handleChange}
          value={confidence}
        />
        <span className='w-[55px] bg-gray-100 text-[#474747] text-center p-1 rounded-lg text-sm'>{confidence}</span>
      </div>
    </div>
  );
};

export default ConfidenceSlider;
