import { FaRegFrown } from "react-icons/fa"; 

const GradeTableModal = ({ results, onClose }) => {
  console.log(results);

  const totalGrade = results.length === 0 
    ? "Invalid" 
    : results.reduce((sum, row) => sum + (row.Grade || 0), 0);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div
        className={`bg-white p-6 rounded-lg shadow-lg max-h-[80vh] overflow-auto ${
          results.length === 0 ? "w-[40vw]" : "w-[80vw]"
        }`}
      >
        <h2 className="text-center text-xl font-semibold mb-4">Grade Submission Results</h2>

        <div className="text-center mb-4">
          <h3 className="font-semibold text-lg">Total Grade: {totalGrade}</h3>
        </div>

        {results.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <FaRegFrown size={50} className="text-gray-500 mb-4" />
            <p className="text-lg font-semibold text-gray-500">No Results</p>
          </div>
        ) : (
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left">Output</th>
                <th className="py-2 px-4 text-left">Expression</th>
                <th className="py-2 px-4 text-left">Grade</th>
                <th className="py-2 px-4 text-left">Result</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, index) => (
                <tr
                  key={index}
                  className={row.Result === 'Mismatch' ? 'bg-red-100' : row.Result === 'Match' ? 'bg-green-100' : 'bg-yellow-100'}
                >
                  <td className="py-2 px-4">{row.Output}</td>
                  <td className="py-2 px-4">{row.Expression}</td>
                  <td className="py-2 px-4">{row.Grade}</td>
                  <td className="py-2 px-4">{row.Result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-4 flex justify-center">
          <button
            className="bg-gray-800 text-white py-2 px-4 rounded-md hover:shadow-lg"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradeTableModal;
