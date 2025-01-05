import { useState, useEffect } from 'react';
import ReactSlider from 'react-slider';

const SetThresholdSlider = ({ onApplyThreshold, value }) => {
  const [thresholdValue, setThresholdValue] = useState(value);
  useEffect(() => {
    setThresholdValue(value);
  }, [value]);

  const applyThreshold = (mode) => {
    onApplyThreshold(thresholdValue, mode);
  };

  return (
    <div className='bg-gray-800 p-4 rounded-lg w-[250px] flex flex-col gap-4 text-white'>
      <h1 className='font-semibold'>Set Threshold (0 - 255):</h1>
      <div className='flex items-center gap-5'>
        <ReactSlider
          className="w-full h-2 rounded-lg items-center flex cursor-pointer" 
          thumbClassName="w-5 h-5 bg-primaryColor rounded-full" 
          trackClassName="h-2 bg-primaryBg"
          min={0}  
          max={255} 
          onChange={(value) => setThresholdValue(value)}
          value={thresholdValue}
        />
        <span className='w-[55px] bg-[#474747] text-center p-1 rounded-lg text-sm'>{thresholdValue}</span>
      </div>
      <div className='flex flex-col gap-2 justify-between text-sm'>
        <button className='bg-primaryColor p-2 rounded-lg' onClick={() => applyThreshold('single')}>Apply to current image</button>
        <button className='bg-thirdBg p-2 rounded-lg' onClick={() => applyThreshold('multiple')}>Apply to all images</button>
      </div>
    </div>
  );
};

export default SetThresholdSlider;
