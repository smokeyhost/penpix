import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAtom } from '../../../atoms/UserAtom';
import { useSetRecoilState } from "recoil";
import axios from "axios";
import useToast from '../../../hooks/useToast';

const LoginForm = ({ onViewChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const { toastSuccess, toastError } = useToast();
  const setUser = useSetRecoilState(UserAtom);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const rememberMe = document.getElementById('remember_me').checked;

    try {
      const response = await axios.post('/auth/login', { email, password, remember: rememberMe }, { withCredentials: true });
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      toastSuccess(response.data.message);
      navigate(`/dashboard/${response.data.user.id}`);
    } catch (error) {
      console.error('There was an error logging in:', error.response?.data || error.message);
      toastError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <div className="bg-white shadow-lg shadow-black/10 p-10 rounded-xl">
        <img src="/icons/PenPix-logo.png" alt="PenPix Logo" className="mb-5 max-w-full h-auto" />
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-10 p-2 border border-gray-400 rounded-lg outline-none focus:border-teal-400"
            />
          </div>
          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"} // Show/Hide password based on state
              id="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-10 p-2 border border-gray-400 rounded-lg outline-none focus:border-teal-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 py-1 text-gray-600 focus:outline-none underline text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="remember_me"
              name="remember_me"
              className="mr-2"
            />
            <div className="flex justify-between items-center w-full">
              <label htmlFor="remember_me" className="text-gray-700">Remember Me</label>
              <span className=" text-sm text-[#828282] hover:text-[#953867] hover:underline cursor-pointer" onClick={() => navigate('/forgot-password')}>Forgot Password?</span>
            </div>
          </div>
          <button
            type="submit"
            className={`w-full h-12 rounded-lg cursor-pointer transition duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#953867] hover:bg-black'} text-white`}
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </button>
          <div className="text-right mt-5 mb-4 text-xs">
            <p className="text-customGray2">No Account? <span className="text-[#953867] hover:underline cursor-pointer" onClick={() => onViewChange('register')}>Sign Up</span></p>
            <br />
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
