import { useState, useContext, createContext } from "react";

const ConfirmModalContext = createContext();

export const useConfirm = () => {
    return useContext(ConfirmModalContext);
};

export const ConfirmModalProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [resolve, setResolve] = useState(null);
    const [requiresVerification, setRequiresVerification] = useState(false);
    const [verificationText, setVerificationText] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const confirm = (message, requiresVerification = false, verificationText = "") => {
        setMessage(message);
        setRequiresVerification(requiresVerification);
        setVerificationText(verificationText);
        setInputValue("");
        setErrorMessage("");
        setIsOpen(true);
        return new Promise((resolve) => {
            setResolve(() => resolve);
        });
    };

    const handleYes = () => {
        if (requiresVerification && inputValue !== verificationText) {
            setErrorMessage("Verification text does not match. Please try again.");
            return;
        }
        resolve(true);
        setIsOpen(false);
    };

    const handleNo = () => {
        resolve(false);
        setIsOpen(false);
    };

    return (
        <ConfirmModalContext.Provider value={confirm}>
            {children}
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <p className="text-lg">{message}</p>
                        {requiresVerification && (
                            <div className="mt-4">
                                <p>Please type <strong>{verificationText}</strong> to confirm:</p>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="border border-gray-300 rounded p-2 mt-2 w-full"
                                />
                                {errorMessage && (
                                    <p className="text-red-500 mt-2">{errorMessage}</p>
                                )}
                            </div>
                        )}
                        <div className="flex justify-end gap-4 mt-4">
                            <button
                                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                                onClick={handleNo}
                            >
                                No
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={handleYes}
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmModalContext.Provider>
    );
};