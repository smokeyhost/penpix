import { useState } from "react";
import { IoSend } from "react-icons/io5";
import { ImSpinner9 } from "react-icons/im";
import useToast from "../../../hooks/useToast"; 
import axios from "axios";

const MessageForm = () => {
  const { toastSuccess, toastError } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, lastName, email, message } = formData;
    if (!firstName || !lastName || !email || !message) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/contact/send-message", formData);

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
      });

      toastSuccess(response.data.message); 
    } catch (error) {
      console.error("Error sending message:", error);
      toastError("Failed to send the message. Please try again."); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contact Now</h2>
        <p className="text-sm text-gray-600">Email us at <a href="mailto:contact@uscpenpix.online" className="text-primaryColor font-medium">contact@uscpenpix.online</a></p>
      </div>
  
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full p-2 border rounded-md h-[150px] max-sm:h-[90px]"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="flex items-center bg-primaryColor text-white px-4 py-2 rounded-md hover:bg-black transition"
          disabled={loading} // Disable button while loading
        >
          {loading ? (
            <>
              Send <ImSpinner9 className="animate-spin ml-2" /> 
            </>
          ) : (
            <>
              Send <IoSend className="ml-2" />
            </>
          )}
        </button>
      </form>
    </div>
  );
  
};

export default MessageForm;
