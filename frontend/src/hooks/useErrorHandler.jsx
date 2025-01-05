// useErrorHandler.js
import { useNavigate } from 'react-router-dom';

const useErrorHandler = () => {
  const navigate = useNavigate();

  const handleError = (errorType, errorMessage) => {
    navigate(`/error`, { state: { errorType, errorMessage } });
  };

  return { handleError };
};

export default useErrorHandler;
