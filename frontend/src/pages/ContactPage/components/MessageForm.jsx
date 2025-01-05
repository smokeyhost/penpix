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
    <div className="flex items-center justify-center min-h-screen bg-white w-full rounded-md px-5 max-md:p-1">
      <div
        className="w-1/2 flex justify-center items-center max-md:hidden"
        data-aos="fade-right"
        data-aos-duration="1000"
      >
        <img
          src="/images/message_icon.png"
          alt="message"
          className="max-w-full max-h-full object-contain"
        />
      </div>

      <div
        className="w-1/2 p-8 flex flex-col justify-between max-md:w-full"
        data-aos="fade-left"
        data-aos-duration="1000"
      >
        <div>
          <h1 className="text-3xl text-center font-semibold animate-bounce">Have some questions?</h1>
          <div className="flex justify-evenly w-full px-5 mt-2 text-customGray2 font-medium text-sm">
            <p>Contact: 09995794343</p>
            <p>Email: penpixusc.edu.ph</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 mt-10 animate-fade-in"
        >
          <div className="flex justify-between gap-10">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-customGray2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full h-12 p-3 border border-customGray1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-[#EEEDF2] transition-transform transform hover:scale-105"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-customGray2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full h-12 p-3 border border-customGray1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-[#EEEDF2] transition-transform transform hover:scale-105"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-customGray2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full h-12 p-3 border border-customGray1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-[#EEEDF2] transition-transform transform hover:scale-105"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-customGray2">Leave us a Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full h-60 p-3 border border-customGray1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-[#EEEDF2] transition-transform transform hover:scale-105"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-fit py-3 px-5 bg-gray-200 text-black rounded-lg flex items-center justify-center hover:bg-primaryColor hover:text-white focus:outline-none ml-auto transition-all duration-200 transform hover:scale-110"
          >
            Send <IoSend className="ml-2 animate-spin-on-hover" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageForm;
