import { useState } from "react";

const Verification = ({ onButtonClick, recoveryEmail, email, contactNumber }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleOptionClick = (method) => {
    setSelectedMethod(method);
  };

  const handleNextClick = () => {
    if (selectedMethod) {
      onButtonClick('passwordRecovery', selectedMethod);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 pb-4 rounded-lg shadow-md text-customBlack1">
      <h1 className="text-2xl font-bold mb-5 text-center">Verify it&apos;s you</h1>
      <p className="text-gray-700 mb-5 text-center">
        To help keep your account safe, we want to make sure it&apos;s really you trying to sign in.
      </p>
      <div>
        <p className="font-medium">Try another way to sign in</p>
        <div className="cursor-pointer font-light">
          {recoveryEmail && (
            <p
              className={`border-t border-customGray1 py-2 px-1 mt-2 ${
                selectedMethod === recoveryEmail ? "bg-customGray1 border-l-4 border-r-4 border-[#953867]" : "hover:bg-customGray1"
              }`}
              onClick={() => handleOptionClick(recoveryEmail)}
            >
              Send password recovery link to {recoveryEmail.replace(/(.{3}).+@/, "$1*****@")}
            </p>
          )}

          <p
            className={`border-t border-customGray1 py-2 px-1 ${
              selectedMethod === email ? "bg-customGray1 border-l-4 border-r-4 border-[#953867]" : "hover:bg-customGray1"
            }`}
            onClick={() => handleOptionClick(email)}
          >
            Send password recovery link to {email.replace(/(.{2}).+@/, "$1*****@")}
          </p>

          {contactNumber && (
            <p
              className={`border-t border-customGray1 py-2 px-1 ${
                selectedMethod === contactNumber ? "bg-customGray1 border-l-4 border-r-4 border-[#953867]" : "hover:bg-customGray1"
              }`}
              onClick={() => handleOptionClick(contactNumber)}
            >
              Get a verification code at {contactNumber.replace(/.(?=.{2})/g, "*")}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-5">
        <button
          type="button"
          className="w-full h-12 bg-gray-200 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-300 transition duration-300"
          onClick={() => onButtonClick('getEmail')}
        >
          Back
        </button>
        <button
          className={`w-full h-12 rounded-lg cursor-pointer transition duration-300 mb-4 ${
            selectedMethod ? "bg-[#953867] hover:bg-customGray3 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={handleNextClick}
          disabled={!selectedMethod}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Verification;
