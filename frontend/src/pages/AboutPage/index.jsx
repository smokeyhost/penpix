import { FaBook, FaExclamationTriangle, FaTools, FaQuestionCircle } from "react-icons/fa";

const AboutPage = () => {
  const scrollToSection = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="container ml-14 p-6">
      <h1 className="text-3xl font-bold mb-6">About PenPix</h1>

      <nav className="mb-8">
        <ul className="flex space-x-4">
          <li><button onClick={() => scrollToSection('background')} className="text-blue-500 hover:underline">Background</button></li>
          <li><button onClick={() => scrollToSection('user-guide')} className="text-blue-500 hover:underline">User Guide</button></li>
          <li><button onClick={() => scrollToSection('limitations')} className="text-blue-500 hover:underline">Limitations</button></li>
          <li><button onClick={() => scrollToSection('issues')} className="text-blue-500 hover:underline">Issues</button></li>
          <li><button onClick={() => scrollToSection('faqs')} className="text-blue-500 hover:underline">FAQs</button></li>
        </ul>
      </nav>

      <section id="background" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FaBook className="mr-2 text-primaryColor" /> Background and Proponents
        </h2>
        <p className="mb-2">PenPix is developed to assist in the evaluation of hand-drawn logic circuit diagrams. The system streamlines task and class management, enhancing interaction for educators and students.</p>
        <p className="mb-2">Developed by Carolinian students of the Computer Engineering Department, this project aims to improve educational workflows efficiently.</p>
        <p className="mb-2">Special thanks to advisers Dr. Luis Gerardo Canete and Engineer Elline Fabian for their invaluable guidance and support.</p>
        <p className="mb-2">For inquiries, contact us at <span className="text-primaryColor font-bold">penpix@gmail.com</span> or visit the Contact Page.</p>
      </section>

      <section id="user-guide" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FaTools className="mr-2 text-primaryColor" /> User Guide
        </h2>
        <p className="mb-2">Follow these steps to manage tasks, classes, and circuit evaluations:</p>
        <ol className="list-decimal list-inside mb-4">
          <li>Navigate to Classes page to view your class.</li>
          <li>Click the &quot;Add Class&quot; card to create a new class.</li>
          <li>Go to the Dashboard to view your tasks.</li>
          <li>Use the &quot;Create Task&quot; button to add new tasks.</li>
          <li>Submit assignments through the &quot;Submission&quot; or &quot;Task&quot; page.</li>
          <li>Assess and grade submissions in the &quot;Circuit Evaluator&quot; page.</li>
        </ol>
        <p className="mb-2">For detailed instructions, view the user manual here...</p>
      </section>

      <section id="limitations" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FaExclamationTriangle className="mr-2 text-primaryColor" /> System Limitations and Best Practices
        </h2>
        <p className="mb-2">While using PenPix, please note the following limitations:</p>
        <ul className="list-disc list-inside mb-4">
          <li>The application does not use WebSockets; refresh the page to update your workspace.</li>
          <li>System performance may slow down due to heavy server resource usage during detection and netlist generation.</li>
          <li>Reopening submissions requires manual due date updates in the Edit Task page.</li>
          <li>Low-quality QR code captures may not be readable.</li>
          <li>Circuit analysis may be inaccurate for unclear, broken, or low-quality lines.</li>
          <li>Gate detection may be unreliable if logic gates are not drawn using the provided template.</li>
          <li>The system only supports two input logic gates.</li>
          <li>Comparison of predictions has a ±5 margin for position and confidence level; double-check flagged submissions.</li>
          <li>Highly complex or densely interconnected circuits may not be accurately processed.</li>
          <li>Poor lighting conditions, blurry images, or low-resolution scans may impact detection results.</li>
          <li>Handwritten annotations outside of circuit symbols are not processed.</li>
          <li>Sequential circuits, such as flip-flops and registers, are not supported.</li>
          <li>Manual verification may be required for ambiguous classifications.</li>
        </ul>
        <p className="mb-2">For best results, follow these guidelines:</p>
        <ul className="list-disc list-inside mb-4">
          <li>Apply a filter before making predictions to remove the grid background.</li>
          <li>Ensure borders are not broken for improved cropping accuracy.</li>
          <li>Use clear, well-lit images of hand-drawn logic circuits.</li>
          <li>Ensure the entire circuit, including the QR code, is visible.</li>
          <li>Draw lines clearly and neatly for better recognition.</li>
          <li>Use a thicker ink or a bold pen to enhance line visibility.</li>
          <li>Follow the template traces to improve detection accuracy.</li>
          <li>Avoid overlapping wires and maintain consistent spacing.</li>
          <li>Keep logic gates within their predefined shapes and sizes.</li>
        </ul>
      </section>

      <section id="issues" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FaQuestionCircle className="mr-2 text-primaryColor" /> Common Issues and Troubleshooting
        </h2>
        <p className="mb-2">Here are some common issues and their solutions:</p>
        <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-1">Issue</th>
              <th className="border border-gray-300 px-2 py-1">Solution</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-2 py-1">Unable to upload files</td>
              <td className="border border-gray-300 px-2 py-1">Ensure the file format is supported (e.g., PNG, JPG) and the file size is within the limit. Follow the naming convention specified in the task instructions.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1">Incorrect gate detection</td>
              <td className="border border-gray-300 px-2 py-1">Use a higher quality image and ensure the circuit is clearly visible. Make sure the logic gates are drawn using the provided template and are not broken or overlapping.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1">System errors during submission</td>
              <td className="border border-gray-300 px-2 py-1">Refresh the page and try again. If the issue persists, check your internet connection or contact support.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1">Low-quality QR code captures</td>
              <td className="border border-gray-300 px-2 py-1">Ensure the QR code is clear and not blurry. Use a higher resolution image and good lighting conditions.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1">Circuit analysis is inaccurate</td>
              <td className="border border-gray-300 px-2 py-1">Ensure the circuit lines are clear and not broken. Avoid using low-quality or blurry images. Follow the provided template for drawing logic gates.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1">Slow system performance</td>
              <td className="border border-gray-300 px-2 py-1">Heavy server resource usage during detection and netlist generation may slow down the system. Try to reduce the complexity of the circuit or perform the analysis during off-peak hours.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1">Sequential circuits not supported</td>
              <td className="border border-gray-300 px-2 py-1">The system only supports combinational logic circuits. Avoid using sequential circuits like flip-flops and registers.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1">Manual verification required for ambiguous classifications</td>
              <td className="border border-gray-300 px-2 py-1">Double-check flagged submissions and manually verify the results if necessary. Use clear and consistent drawing practices to minimize ambiguities.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1">Comparison of predictions has a ±5 margin for position and confidence level</td>
              <td className="border border-gray-300 px-2 py-1">Double-check flagged submissions and manually verify the results if necessary. Ensure the circuit is drawn accurately and clearly.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="faqs" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FaQuestionCircle className="mr-2 text-primaryColor" /> FAQs
        </h2>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: What is PenPix?</h3>
          <p className="ml-4">A: PenPix is a system developed to assist in the evaluation of hand-drawn logic circuit diagrams. It streamlines task and class management, enhancing interaction for educators and students.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: Who developed PenPix?</h3>
          <p className="ml-4">A: PenPix was developed by Carolinian students of the Computer Engineering Department, with guidance from advisers Dr. Luis Gerardo Canete and Engineer Elline Fabian.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: How do I create a new task?</h3>
          <p className="ml-4">A: Navigate to the Dashboard and click the &quot;Create Task&quot; button. Fill in the required details and save the task.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: How can I submit files?</h3>
          <p className="ml-4">A: Go to the &quot;Submission&quot; page and upload the assignment file while following the naming convention or navigate to the Task Page and upload files.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: How do I create a new class?</h3>
          <p className="ml-4">A: Navigate to the Classes page and click the &quot;Add Class&quot; card. Fill in the required details and save the class.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: How do I view my tasks?</h3>
          <p className="ml-4">A: Go to the Dashboard to view all your tasks.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: How do I assess and grade submissions?</h3>
          <p className="ml-4">A: Navigate to the &quot;Circuit Evaluator&quot; page, select the submission, and use the provided tools to assess and grade it.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: What should I do if the system fails to detect gates correctly?</h3>
          <p className="ml-4">A: Ensure that the image quality is high and the circuit is clearly visible. If the issue persists, contact support.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: What file formats are supported for uploads?</h3>
          <p className="ml-4">A: The system supports PNG, JPG, and PDF file formats.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: What should I do if I encounter a system error during submission?</h3>
          <p className="ml-4">A: Refresh the page and try again. If the issue persists, check your internet connection or contact support.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: How do I handle low-quality QR code captures?</h3>
          <p className="ml-4">A: Ensure the QR code is clear and not blurry. Use a higher resolution image and good lighting conditions.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: What should I do if the circuit analysis is inaccurate?</h3>
          <p className="ml-4">A: Ensure the circuit lines are clear and not broken. Avoid using low-quality or blurry images. Follow the provided template for drawing logic gates.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: Does the system support sequential circuits?</h3>
          <p className="ml-4">A: No, the system only supports combinational logic circuits. Avoid using sequential circuits like flip-flops and registers.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: Can I reopen submissions after the due date?</h3>
          <p className="ml-4">A: Yes, but you need to manually update the due date in the Edit Task page.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: How do I ensure accurate gate detection?</h3>
          <p className="ml-4">A: Use a higher quality image and ensure the circuit is clearly visible. Make sure the logic gates are drawn using the provided template and are not broken or overlapping.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: What should I do if the system performance is slow?</h3>
          <p className="ml-4">A: Heavy server resource usage during detection and netlist generation may slow down the system. Try to reduce the complexity of the circuit or perform the analysis during off-peak hours.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: How do I handle incorrect or low confidence level predictions?</h3>
          <p className="ml-4">A: Click the prediction and select from the options the class or remove the prediction completely.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: How can I contact support?</h3>
          <p className="ml-4">A: For inquiries, contact us at penpix@gmail.com or visit the Contact Page.</p>
        </div>
        <div className="faq-item mb-4">
          <h3 className="text-xl font-semibold">Q: Where can I find the user manual?</h3>
          <p className="ml-4">A: The user manual is available on the User Guide section of the About Page.</p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;