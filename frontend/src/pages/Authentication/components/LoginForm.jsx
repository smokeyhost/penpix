import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAtom } from '../../../atoms/UserAtom';
import { useSetRecoilState } from "recoil";
import axios from "axios";

const LoginForm = ({ onViewChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState(null); 
  const setUser = useSetRecoilState(UserAtom);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null); 

    const rememberMe = document.getElementById('remember-me').checked;

    try {
      const response = await axios.post('/auth/login', { email, password, remember: rememberMe }, { withCredentials: true });
      // if (rememberMe){
        localStorage.setItem('user', JSON.stringify(response.data.user));
      // }
      
      setUser(response.data.user);
      navigate(`/dashboard/${response.data.user.id}`);
    } catch (error) {
      console.error('There was an error logging in:', error.response?.data || error.message);
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md p-6 sm:p-10 rounded-lg w-full max-w-xs sm:max-w-sm mx-auto">
      <img src="/icons/PenPix-logo.png" alt="PenPix Logo" className="mb-5 max-w-full h-auto" />
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="email"
            maxLength={30}
            id="login-email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-10 p-2 border border-gray-400 rounded-lg outline-none focus:border-teal-400 text-sm sm:text-base"
          />
        </div>
        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            maxLength={15}
            id="login-password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-10 p-2 border border-gray-400 rounded-lg outline-none focus:border-teal-400 text-sm sm:text-base"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-3 py-1 text-gray-600 focus:outline-none underline text-xs sm:text-sm"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-xs sm:text-sm mb-4" id="error-container">{error}</p>
        )}
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="remember-me"
            name="remember_me"
            className="mr-2"
          />
          <div className="flex justify-between items-center w-full">
            <label htmlFor="remember_me" className="text-gray-700 text-xs sm:text-sm">Remember Me</label>
            <span id="forgot-password-link" className="text-xs sm:text-sm text-[#828282] hover:text-[#953867] hover:underline cursor-pointer" onClick={() => navigate('/forgot-password')}>Forgot Password?</span>
          </div>
        </div>
        <button
          id="login-button"
          type="submit"
          className={`w-full h-10 sm:h-12 rounded-lg cursor-pointer transition duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#953867] hover:bg-black'} text-white text-sm sm:text-base`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Login"}
        </button>
        <div className="text-right mt-5 mb-4 text-xs">
          <p className="text-customGray2">No Account? <span 
          id="register-link"
          className="text-[#953867] hover:underline cursor-pointer" onClick={() => onViewChange('register')}>Sign Up</span></p>
          <br />
        </div>
      </form>
    </div>
  );
};

export default LoginForm;