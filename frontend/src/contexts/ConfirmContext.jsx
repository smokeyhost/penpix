import { useState, useContext, createContext } from "react";

const ConfirmModalContext = createContext();

export const useConfirm = () => {
    return useContext(ConfirmModalContext);
};

export const ConfirmModalProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [resolve, setResolve] = useState(null);

    const confirm = (message) => {
        setMessage(message);
        setIsOpen(true);
        return new Promise((resolve) => {
            setResolve(() => resolve);
        });
    };

    const handleYes = () => {
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
