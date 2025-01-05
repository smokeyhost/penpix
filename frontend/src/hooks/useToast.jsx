// src/hooks/useToast.js
import { useToast as useToastContext } from '../contexts/ToastContext';

const useToast = () => {
  const { showToast } = useToastContext();

  const toastSuccess = (message) => showToast(message, 'success');
  const toastError = (message) => showToast(message, 'error');
  const toastInfo = (message) => showToast(message, 'info');
  const toastWarning = (message) => showToast(message, 'warning');

  return {
    toastSuccess,
    toastError,
    toastInfo,
    toastWarning,
  };
};

export default useToast;
