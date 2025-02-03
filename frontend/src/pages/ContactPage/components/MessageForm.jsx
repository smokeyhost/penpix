import { useState } from "react";
import { IoSend } from "react-icons/io5";
import axios from "axios";

const MessageForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

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

    try {
      const response = await axios.post("/contact/send-message", formData);
      console.log("Message sent:", response.data);

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
      });
      alert("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send the message. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring focus:ring-teal-300"
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
            className="w-full p-2 border rounded-md focus:ring focus:ring-teal-300"
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
          className="w-full p-2 border rounded-md focus:ring focus:ring-teal-300"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="w-full p-2 border rounded-md focus:ring focus:ring-teal-300 h-32"
          required
        ></textarea>
      </div>
      <button
        type="submit"
        className="flex items-center bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
      >
        Send <IoSend className="ml-2" />
      </button>
    </form>
  );
};

export default MessageForm;
