// src/components/Toast.js
import { useEffect } from 'react';

const Toast = ({ message, type, onClose }) => {
  // Function to determine the background color based on type
  const getTypeClass = () => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'info': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-gray-500'; // Default color if type is unknown
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg text-white shadow-lg ${getTypeClass()} transition-transform transform-gpu`} style={{ minWidth: '200px' }}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-xl font-bold">&times;</button>
      </div>
    </div>
  );
};

export default Toast;
