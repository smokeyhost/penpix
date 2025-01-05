import { IoClose } from "react-icons/io5";

const CompareTruthTable = ({ answerTable, circuitTruthTable, onClose }) => {
  const answerKeys = Object.keys(answerTable);
  const submittedKeys = Object.keys(circuitTruthTable);
  const allKeys = [...new Set([...answerKeys, ...submittedKeys])];
  
  const generateRows = () => {
    const rowCount = Object.values(answerTable.length === 0 ? circuitTruthTable : answerTable)[0]?.length || 0;
    const rows = [];

    for (let i = 0; i < rowCount; i++) {
      const row = { inputs: [], answers: {}, submissions: {} };

      allKeys.forEach((key) => {
        const answerRow = answerTable[key]?.[i] || [];
        const submittedRow = circuitTruthTable[key]?.[i] || [];
        row.inputs = answerRow.length === 0 ? submittedRow.slice(0, -1) : answerRow.slice(0, -1); 
        row.answers[key] = answerRow[answerRow.length - 1] || "-";
        row.submissions[key] = submittedRow[submittedRow.length - 1] || "-";
      });

      rows.push(row);
    }

    return rows;
  };

  const rows = generateRows();
  const inputHeaders = Object.values(answerTable.length === 0 ? circuitTruthTable : answerTable)[0]?.[0]?.slice(0, -1) || [];
  const inputLabels = inputHeaders.map((_, index) => `X${index + 1}`);

  const hasMismatch = (key, index) =>
    rows[index]?.answers[key] !== rows[index]?.submissions[key];

  if (!answerKeys.length && !submittedKeys.length) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg w-[40vw] h-[20vh] p-6 flex flex-col items-center justify-center relative">
          <IoClose
            size={20}
            className="absolute top-2 right-3 text-gray-600 hover:text-gray-800 cursor-pointer"
            onClick={onClose}
          />
          <p className="text-lg font-semibold text-gray-700 text-center">
            No valid boolean expressions detected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-[90vw] h-[80vh] p-6 relative flex flex-col">
        <IoClose
          size={20}
          className="absolute top-2 right-3 text-gray-600 hover:text-gray-800 cursor-pointer"
          onClick={onClose}
        />
        <div className="mt-2 text-center">
          <h2 className="text-xl font-bold text-gray-800">Truth Table Comparison</h2>
          <p className="text-gray-600 mt-1">
            This table compares the truth table generated from your circuit against the expected truth table.
            Mismatched entries are highlighted for easy identification.
          </p>
        </div>
        <div className="overflow-y-auto flex-grow mt-5">
          <table className="table-auto border-collapse border border-gray-400 w-full text-sm">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                {inputLabels.map((label, index) => (
                  <th
                    key={`input-header-${index}`}
                    className="border border-gray-400 px-4 py-2 whitespace-nowrap"
                  >
                    {label}
                  </th>
                ))}
                {allKeys.map((key) => (
                  <th
                    key={`answer-${key}`}
                    className="border border-gray-400 px-4 py-2 whitespace-nowrap"
                  >
                    {key} (Answer)
                  </th>
                ))}
                {allKeys.map((key) => (
                  <th
                    key={`submitted-${key}`}
                    className="border border-gray-400 px-4 py-2 whitespace-nowrap"
                  >
                    {key} (Submitted)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`row-${index}`}>
                  {row.inputs.map((input, inputIndex) => (
                    <td
                      key={`input-${index}-${inputIndex}`}
                      className="border border-gray-400 px-4 py-2 text-center"
                    >
                      {input}
                    </td>
                  ))}
                  {allKeys.map((key) => (
                    <td
                      key={`answer-${key}-${index}`}
                      className={`border border-gray-400 px-4 py-2 text-center ${
                        hasMismatch(key, index) ? "bg-red-100" : ""
                      }`}
                    >
                      {row.answers[key]}
                    </td>
                  ))}
                  {allKeys.map((key) => (
                    <td
                      key={`submitted-${key}-${index}`}
                      className={`border border-gray-400 px-4 py-2 text-center ${
                        hasMismatch(key, index) ? "bg-red-100" : ""
                      }`}
                    >
                      {row.submissions[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default CompareTruthTable