import { useState } from "react";
import axios from "axios";
import useToast from '../../../hooks/useToast';

const RegisterForm = ({ onViewChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRepassword] = useState('');
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toastSuccess } = useToast();

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter.");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter.");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number.");
    }
    return errors;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const errors = validatePassword(newPassword);
    setPasswordError(errors.join(" "));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== repassword) {
      setError("Passwords do not match.");
      return;
    }

    // Validate email domain
    if (!email.endsWith('@usc.edu.ph')) {
      setError("Invalid email domain. Only @usc.edu.ph emails are allowed.");
      return;
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setPasswordError(passwordErrors.join(" "));
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/auth/register', {
        email,
        password
      });

      toastSuccess(response.data.message);
      setError(null);
      setPasswordError(null);
      onViewChange('login');

    } catch (error) {
      console.error('There was an error registering:', error.response?.data || error.message);
      setError(error.response?.data.error);

    } finally {
      setLoading(false); 
    }
  };

  return (
    <div id="register-form" className="bg-white shadow-md p-6 sm:p-10 rounded-lg w-full max-w-xs sm:max-w-sm mx-auto">
      <div>
        <img src="/icons/PenPix-logo.png" alt="PenPix Logo" className="mb-5 w-35 h-16 sm:w-25 sm:h-20" />
        <h1 className="text-lg sm:text-xl mb-6 font-bold text-center">Create Account</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="email"
            maxLength={30}
            id="email"
            name="email"
            placeholder="University Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-10 p-2 border border-gray-300 rounded-lg outline-none focus:border-teal-400 text-sm sm:text-base"
          />
        </div>

        {/* Password field with toggle visibility */}
        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            maxLength={15}
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
            className="w-full h-10 p-2 border border-gray-300 rounded-lg outline-none focus:border-teal-400 text-sm sm:text-base"
          />
          <button
            type="button"
            className="absolute right-2 top-3 text-xs sm:text-sm text-gray-500 underline"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {passwordError && (
          <p className="text-red-500 text-xs sm:text-sm mb-4" id="error-container">{passwordError}</p>
        )}

        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            maxLength={15}
            id="repassword"
            name="repassword"
            placeholder="Re-Enter Password"
            value={repassword}
            onChange={(e) => setRepassword(e.target.value)}
            required
            className="w-full h-10 p-2 border border-gray-300 rounded-lg outline-none focus:border-teal-400 text-sm sm:text-base"
          />
        </div>

        {error && <p id="error-container" className="text-red-500 text-xs sm:text-sm mb-4">{error}</p>}
        <button
          id="register-button"
          type="submit"
          className={`w-full h-10 sm:h-12 rounded-lg cursor-pointer transition duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#953867] hover:bg-black'} text-white text-sm sm:text-base`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Sign up"}
        </button>

        <div className="text-right mt-5 mb-4 text-xs sm:text-sm">
          <p className="text-customGray2">
            Already have an account?{' '}
            <span
              className="text-[#953867] hover:underline cursor-pointer"
              onClick={() => onViewChange('login')}
            >
              Login
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;