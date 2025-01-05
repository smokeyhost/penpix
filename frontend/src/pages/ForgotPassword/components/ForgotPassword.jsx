import { useState } from "react";
import Verification from "./Verification";
import PasswordRecovery from "./PasswordRecovery";
import axios from "axios"; // Uncomment axios for API calls
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [showComponent, setShowComponent] = useState('getEmail');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [selectedOption, setSelectedOption] = useState("");

  const navigate = useNavigate()

  const handleGetRecoveryInfo = async () => {
    if (!email || !isValidEmail(email)) return; // Only proceed if email is valid
    setLoading(true); 
    try {
      const response = await axios.post("/auth/check-recovery-info", {
        email: email,
      });

      const { recovery_email, contact_number } = response.data;
      setRecoveryEmail(recovery_email);
      setContactNumber(contact_number);
      setError(""); 
      setShowComponent('verifyEmail');
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false); 
    }
  };

  const handleRequestReset = async (option) => {
    setSelectedOption(option);
    if (!option) return; // Do not proceed if option is not valid
    try {
      await axios.post("/auth/forgot-password", {
        email: option,
      });
      setError(""); 
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false); 
    }
  };

  const isValidEmail = (email) => {
    // Simple regex for email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  return (
    <div>
      {showComponent === 'getEmail' && (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-5 text-center">Password Recovery</h1>
          <p className="text-gray-700 mb-5 text-center">
            Enter your university email and we&apos;ll send you a link to recover your password.
          </p>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <div className="mb-4">
            <input
              type="email"
              id="recovery-email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 p-2 border border-gray-400 rounded-lg outline-none focus:border-teal-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="w-full h-12 bg-gray-200 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-300 transition duration-300"
              onClick={() => navigate("/auth")}
            >
              Cancel
            </button>
            <button
              className={`w-full h-12 rounded-lg cursor-pointer transition duration-300 mb-4 bg-[#953867] hover:bg-customGray3 text-white`}
              onClick={handleGetRecoveryInfo}
              disabled={loading || !isValidEmail(email)}
            >
              {loading ? "Loading..." : "Confirm"}
            </button>
          </div>
        </div>
      )}

      {showComponent === 'verifyEmail' && (
        <Verification 
          onButtonClick={(component, option) => {
            setShowComponent(component);
            if (option) {
              handleRequestReset(option);
            }
          }}
          recoveryEmail={recoveryEmail}
          email={email}
          contactNumber={contactNumber}
        />
      )}

      {showComponent === 'passwordRecovery' && (
        <PasswordRecovery 
          email={selectedOption} 
          resendEmail={handleRequestReset}
        />
      )}
       {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default ForgotPassword;
