// src/contexts/ToastContext.js
import { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast'; // Ensure the path is correct

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    // Automatically hide toast after 3 seconds
    setTimeout(() => setToast(null), 3000);
  };

  const handleClose = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleClose}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
