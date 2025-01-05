import { useState } from "react";
import axios from "axios";
import useToast from '../../../hooks/useToast';

const RegisterForm = ({ onViewChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRepassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const { toastSuccess } = useToast();

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

    setLoading(true);

    try {
      const response = await axios.post('/auth/register', {
        email,
        password
      });

      toastSuccess(response.data.message);
      setError(null);
      onViewChange('login');

    } catch (error) {
      console.error('There was an error registering:', error.response?.data || error.message);
      setError("Registration failed. Please try again.");

    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="bg-white shadow-md p-10 rounded-lg w-full max-w-sm mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create an account</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="email"
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
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        {/* Re-Enter Password field */}
        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            id="repassword"
            name="repassword"
            placeholder="Re-Enter Password"
            value={repassword}
            onChange={(e) => setRepassword(e.target.value)}
            required
            className="w-full h-10 p-2 border border-gray-300 rounded-lg outline-none focus:border-teal-400"
          />
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
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
