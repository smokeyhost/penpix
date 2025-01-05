import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import axios from 'axios';

const EmailVerificationPage = () => {
  const location = useLocation(); 
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false); 

  useEffect(() => {
    const verifyEmail = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token'); 

      if (token) {
        try {
          const response = await axios.post('/auth/verify-email', { token:token });
          if (response.data.message) {
            setVerificationStatus(response.data.message); 
            setIsSuccess(true);
          } else if (response.data.error) {
            setVerificationStatus(response.data.error); 
            setIsSuccess(false); 
          }
        } catch (error) {
          setVerificationStatus('An error occurred. Please try again.');
          setIsSuccess(false);
          console.error('Error verifying email:', error.message);
        }
      } else {
        setVerificationStatus('No token found in URL.');
        setIsSuccess(false);
      }
      setLoading(false);
    };

    verifyEmail();
  }, [location.search]); 

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-500"></div>
        <p className="text-xl font-semibold mt-4">Verifying your email...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-6">Email Verification</h1>
        <p className={`text-lg mb-6 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
          {verificationStatus}
        </p>
        {isSuccess && (
          <button 
            className="px-6 py-2 text-white bg-primaryColor hover:bg-blue-600 rounded-lg focus:outline-none"
            onClick={() => navigate('/auth')}
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
