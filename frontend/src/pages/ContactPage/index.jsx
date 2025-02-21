import MessageForm from './components/MessageForm';

const ContactPage = () => {
  return (
    <div className="w-full h-screen">
       <div className="bg-gray-100 flex items-center justify-center p-6 w-full h-full">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
          <div className="md:w-1/2 p-6 flex items-center justify-center bg-primaryColor text-white">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold">Get in Touch</h2>
              <p className="mt-2 text-lg sm:text-xl">We&apos;d love to hear from you! Send us a message.</p>
            </div>
          </div>
          <div className="md:w-1/2 p-6">
            <MessageForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
