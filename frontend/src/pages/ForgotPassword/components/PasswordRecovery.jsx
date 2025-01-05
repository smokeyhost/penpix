import { useState } from "react";

const PasswordRecovery = ({ email, resendEmail }) => {
  const [resendMessage, setResendMessage] = useState("");

  const handleResend = (email) => {
    resendEmail(email);
    setResendMessage("Check your email address or refresh the page for the reset link.");

    // Clear the message after 3 seconds
    setTimeout(() => {
      setResendMessage("");
    }, 3000);
  };

  const handleOpenGmail = () => {
    window.open("https://mail.google.com", "_blank");
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md text-customBlack1">
      <h1 className="text-2xl font-bold mb-5 text-center">Password Recovery</h1>
      <p className="text-gray-700 mb-5 text-center">
        We have sent a link to your recovery email {email.replace(/(.{2}).+@/, "$1*****@")} Click the link inside to reset your password.
      </p>
      
      {/* Display the resend message if it exists */}
      {resendMessage && (
        <p className="text-green-500 mb-4 text-center">{resendMessage}</p>
      )}

      <div>
        <div className="flex flex-col gap-2 mt-2">
          <button
            type="button"
            className="w-[200px] bg-[#F2F2F2] text-gray-700 rounded-lg cursor-pointer hover:bg-gray-300 transition duration-300 mx-auto flex items-center gap-2 justify-center py-2"
            onClick={handleOpenGmail} // Call the function to open Gmail
          >
            <img src="./icons/gmail.png" alt="gmail" className="w-[25px] h-[25px]"/>
            <span>Open Gmail</span>
          </button>
          <button
            className={`w-full h-12 rounded-lg cursor-pointer transition duration-300 mb-4 text-[#953867] font-semibold hover:underline`}
            onClick={() => handleResend(email)} // Use the handleResend function
          >
            Resend Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecovery;
