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
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
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
      setLoading(false); // End loading
    }
  };

  return (
    <div 
      id="register-form"
      className="bg-white shadow-md p-10 rounded-lg w-full max-w-sm mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create an account</h1>
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
            className="w-full h-10 p-2 border border-gray-300 rounded-lg outline-none focus:border-teal-400"
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
            className="w-full h-10 p-2 border border-gray-300 rounded-lg outline-none focus:border-teal-400"
          />
          <button
            type="button"
            className="absolute right-2 top-3 text-sm text-gray-500 underline"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {passwordError && (
          <p className="text-red-500 text-sm mb-4">{passwordError}</p>
        )}

        {/* Re-Enter Password field */}
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
            className="w-full h-10 p-2 border border-gray-300 rounded-lg outline-none focus:border-teal-400"
          />
        </div>

        {error && <p id="error-container" className="text-red-500 mb-4">{error}</p>}
        <button
          id="register-button"
          type="submit"
          className={`w-full h-12 rounded-lg cursor-pointer transition duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#953867] hover:bg-black'} text-white`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Sign up"}
        </button>

        <div className="text-right mt-6">
          <p className="text-xs text-customGray2">
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