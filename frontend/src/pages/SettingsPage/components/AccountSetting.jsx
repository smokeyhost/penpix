import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AccountSetting = ({
  profile,
  isChangePassword,
  isChangeRecoveryEmail,
  onSaveRecoveryEmail,
  onSavePassword,
  onCancelPassword,
  onCancelRecoveryEmail,
  onChangePassword,
  onChangeRecoveryEmail,
}) => {
  const [newRecoveryEmail, setNewRecoveryEmail] = useState(profile.recoveryEmail)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState(""); 
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [passwordError, setPasswordError] = useState(""); 
  const [apiError, setApiError] = useState(""); 
  const [fieldError, setFieldError] = useState("");
  const navigate = useNavigate()

  const validateCurrentPassword = async () => {
    try {
      const response = await axios.post('/auth/validate-password', {
        password: currentPassword,
        email: profile.email
      });
      return response.status === 200; 
    } catch (error) {
      console.error("Error validating password:", error);
      setApiError("An error occurred while validating the password.");
      return false; 
    }
  };

  const handleSaveRecoveryEmail = () => {
    setFieldError(""); 

    if (!newRecoveryEmail) {
      setFieldError("Recovery email cannot be empty.");
      return;
    }

    setFieldError("");
    onSaveRecoveryEmail(newRecoveryEmail);
  };

  const handleSavePassword = async () => {
    setFieldError(""); // Reset field error message

    if (!currentPassword || !newPassword || !confirmPassword) {
      setFieldError("All password fields must be filled.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    const isCurrentPasswordValid = await validateCurrentPassword();
    if (!isCurrentPasswordValid) {
      setPasswordError("Current password is incorrect.");
      return;
    }

    setPasswordError("");
    setApiError("");

    onSavePassword( newPassword ); 

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-lg font-semibold">Account</h2>
      <div className="ml-4 flex flex-col gap-3">
        <div className="flex items-center h-10 ">
          <label className="text-customGray2 text-lg">Recovery Email: </label>
          {!isChangeRecoveryEmail ? (
            <span className="ml-2">{newRecoveryEmail}</span>
          ) : (
            <input
              className="text-customGray2 px-2 border-2 border-customGray1 ml-2 h-[40px]" 
              placeholder="Recovery Email"
              type="email"
              name="recoveryEmail"
              value={newRecoveryEmail}
              onChange={(e) => setNewRecoveryEmail(e.target.value)}
            />
          )}
        </div>

        {!isChangeRecoveryEmail ? (
          <button 
            className="bg-customGray1 w-[280px] py-2 rounded-sm"
            onClick={onChangeRecoveryEmail}
          >
            Change Recovery Email
          </button>
        ) : (
          <div className="flex w-1/2 gap-4">
            <button className="bg-customGray1 flex-1 py-2 rounded-sm" onClick={onCancelRecoveryEmail}>Cancel</button>
            <button className="bg-[#34C759] flex-1 py-2 rounded-sm" onClick={handleSaveRecoveryEmail}>Save</button>
          </div>
        )}

        {isChangePassword ? (
          <div className="flex flex-col gap-2 w-[280px]">
            <input
              className="text-customGray2 px-2 border-2 border-customGray1 h-[40px]"
              placeholder="Current Password"
              type="password"
              value={currentPassword}
              required
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              className="text-customGray2 px-2 border-2 mt-4 border-customGray1 h-[40px]"
              placeholder="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              className="text-customGray2 px-2 border-2 border-customGray1 h-[40px]"
              placeholder="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
            {apiError && <p style={{ color: "red" }}>{apiError}</p>} {/* Display API error */}
            {fieldError && <p style={{ color: "red" }}>{fieldError}</p>} {/* Display field error */}

            <div className="flex gap-4">
              <button className="bg-customGray1 flex-1 py-2 rounded-sm" onClick={onCancelPassword}>Cancel</button>
              <button className="bg-[#34C759] flex-1 py-2 rounded-sm" onClick={handleSavePassword}>Save</button>
            </div>
          </div>
        ) : (
          <button 
            className="bg-customGray1 w-[280px] py-2 rounded-sm"
            onClick={onChangePassword}
          >
            Change Password
          </button>
        )}
        <button className="bg-customGray1 w-[280px] py-2 rounded-sm" onClick={() => navigate('/forgot-password')}>Forgot Password</button>
      </div>
    </div>
  );
};

export default AccountSetting;
