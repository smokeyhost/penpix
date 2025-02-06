import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import useLogout from '../../hooks/useLogoutUser';

const LandingPage = () => {
  const navigate = useNavigate();
  const { logout } = useLogout();

  useEffect(() => {
    const checkSession = async () => {
      try {
        await axios.get('auth/check-session', { withCredentials: true });
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          console.error('Session expired');
        }
      }
    };

    checkSession();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white px-6">
      <h1 className="text-5xl font-bold mb-4 text-center">Welcome to PenPix</h1>
      <p className="text-lg text-center max-w-2xl mb-6">
        Transform your hand-drawn logic circuits into digital netlists with ease.  
        Get started by logging in to your workspace.
      </p>
      <button
        onClick={() => navigate('/auth')}
        className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
      >
        Login
      </button>
    </div>
  );
};

export default LandingPage;
