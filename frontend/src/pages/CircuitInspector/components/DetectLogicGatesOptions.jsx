import { useEffect, useState } from "react";

const DetectLogicGatesOption = ({ onDetectLogicGates, loading }) => {
  const [showCompletionText, setShowCompletionText] = useState(false);
  const [processing, setProcessing] = useState(false); 
  
  useEffect(() => {
    if (loading) {
      setProcessing(true);
    } else {
      if (processing) {
        setShowCompletionText(true);
        const timer = setTimeout(() => {
          setShowCompletionText(false);
          setProcessing(false); 
        }, 2000); 
        return () => clearTimeout(timer);
      }
    }
  }, [loading, processing]);

  return (
    <div className='bg-gray-800 p-4 rounded-lg w-[250px] flex flex-col gap-4 text-white'>
      <h1 className='font-semibold'>Detect Logic Gates:</h1>

      {loading ? (
        <div className='flex flex-col justify-center items-center h-24'>
          <div className='animate-spin border-t-4 border-primaryColor border-solid rounded-full w-8 h-8'></div>
          <p className='mt-2'>Processing...</p>
        </div>
      ) : showCompletionText ? (
        <div className='flex flex-col justify-center items-center h-24'>
          <p className='mt-2'>Process Completed</p>
        </div>
      ) : (
        <div className='flex flex-col gap-3 justify-between text-sm'>
          <button className='bg-primaryColor p-2 rounded-lg' onClick={() => onDetectLogicGates('single')}>
            Process current image
          </button>

          <button className='bg-thirdBg p-2 rounded-lg' onClick={() => onDetectLogicGates('multiple')}>
            Process all images
          </button>
        </div>
      )}
    </div>
  );
};

export default DetectLogicGatesOption;
