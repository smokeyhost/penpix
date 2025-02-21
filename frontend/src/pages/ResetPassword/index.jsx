import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useToast from '../../hooks/useToast';
import axios from "axios";
import style from './index.module.css';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [validToken, setValidToken] = useState(null); // `null` indicates loading state
  const { toastSuccess, toastError } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the token from the URL
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  useEffect(() => {
    document.body.style.overflowY = "hidden"; 
    return () => {
      document.body.style.overflowY = "auto"; // Restore when unmounting
    };
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await axios.post('/auth/verify-reset-token', { token });
          setValidToken(true);
          toastSuccess(res.data.message);
        } catch (error) {
          console.error(error);
          setValidToken(false);
          console.error(error?.response?.data?.error);
          toastError(error?.response?.data?.error);
          navigate("/auth"); // Redirect if the token is invalid or expired
        }
      } else {
        setValidToken(false);
        navigate("/auth"); // Redirect if no token is provided
      }
    };

    verifyToken();
  }, [token]);

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long.`;
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!hasNumber) {
      return "Password must contain at least one number.";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post("/auth/reset-password", {
        token,
        new_password: password
      });

      setMessage(response.data.message);
      navigate("/auth"); // Redirect to login page or another page after successful reset
    } catch (error) {
      setError(error.response?.data?.error || "An error occurred.");
    }
  };

  if (validToken === null) {
    return <div>Loading...</div>; // Optional: Loading state while verifying token
  }

  if (!validToken) {
    return null; // Optionally return nothing if token is invalid or redirect happens
  }

  return (
    <div className={`${style.bg_cover} ${style.bg_image} min-h-screen flex items-center justify-center`}>
      <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-5 text-center">Reset Password</h1>
        <p className="text-gray-700 mb-5 text-center">
          Enter your new password below.
        </p>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="password"
              id="new-password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-10 p-2 border border-gray-400 rounded-lg outline-none focus:border-teal-400"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              id="confirm-password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full h-10 p-2 border border-gray-400 rounded-lg outline-none focus:border-teal-400"
            />
          </div>
          <button
            type="submit"
            className="w-full h-12 bg-[#953867] text-white rounded-lg cursor-pointer hover:bg-black transition duration-300 mb-4"
          >
            Set Password
          </button>
          <button
            type="button"
            className="w-full h-12 bg-gray-200 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-300 transition duration-300"
            onClick={() => navigate("/auth")}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;