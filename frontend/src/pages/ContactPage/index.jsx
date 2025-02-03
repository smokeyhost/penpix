import MessageForm from './components/MessageForm';

const ContactPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        <div className="md:w-1/2 p-6 flex items-center justify-center bg-teal-500 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Get in Touch</h2>
            <p className="mt-2 text-lg">We&apos;d love to hear from you! Send us a message.</p>
          </div>
        </div>
        <div className="md:w-1/2 p-6">
          <MessageForm />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;