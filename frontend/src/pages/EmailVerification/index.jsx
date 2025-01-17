import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const EmailVerification = () => {
  const [verificationStatus, setVerificationStatus] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token'); 
      console.log("Token", token);
      if (token) {
        try {
          const response = await axios.post('/auth/verify-email', { token: token });
          if (response.data.success) {
            console.log("Verified");
            setVerificationStatus(response.data.message); 
            setIsSuccess(true);
            setTimeout(() => {
              navigate('/auth'); // Navigate to the authentication page after 3 seconds
            }, 3000);
          } else {
            setVerificationStatus(response.data.error); 
            setIsSuccess(false); 
          }
        } catch (error) {
          // setVerificationStatus('An error occurred. Please try again.');
          // setIsSuccess(false);
          console.error('Error verifying email:', error.message);
        }
      } else {
        setVerificationStatus('No token found in URL.');
        setIsSuccess(false);
      }
      setLoading(false);
    };

    verifyEmail();
  }, [location.search, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        <p className="mb-4">{verificationStatus}</p>
        {isSuccess ? (
          <p className="text-green-500">Your email has been successfully verified! Redirecting to login...</p>
        ) : (
          <p className="text-red-500">There was an issue verifying your email. Please try again.</p>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;