import { IoClose } from "react-icons/io5";

const CompareTruthTable = ({ answerTable, circuitTruthTable, onClose }) => {
  const answerKeys = Object.keys(answerTable);
  const submittedKeys = Object.keys(circuitTruthTable);
  const allKeys = [...new Set([...answerKeys, ...submittedKeys])];

  const extractOutputs = (table) => {
    const keys = Object.keys(table);
    const outputs = {};

    keys.forEach((key) => {
      outputs[key] = table[key].map(row => row[row.length - 1]);
    });

    return outputs;
  };

  const compareOutputs = (answerOutputs, submittedOutputs) => {
    const matches = [];
    const unmatchedAnswers = new Set(Object.keys(answerOutputs));
    const unmatchedSubmissions = new Set(Object.keys(submittedOutputs));

    Object.keys(answerOutputs).forEach(answerKey => {
      Object.keys(submittedOutputs).forEach(submittedKey => {
        if (JSON.stringify(answerOutputs[answerKey]) === JSON.stringify(submittedOutputs[submittedKey])) {
          matches.push({ answerKey, submittedKey });
          unmatchedAnswers.delete(answerKey);
          unmatchedSubmissions.delete(submittedKey);
        }
      });
    });

    return { matches, unmatchedAnswers: Array.from(unmatchedAnswers), unmatchedSubmissions: Array.from(unmatchedSubmissions) };
  };

  const answerOutputs = extractOutputs(answerTable);
  const submittedOutputs = extractOutputs(circuitTruthTable);
  const { matches, unmatchedAnswers, unmatchedSubmissions } = compareOutputs(answerOutputs, submittedOutputs);

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
  const answerInputHeaders = Object.values(answerTable)[0]?.[0]?.slice(0, -1) || [];
  const submittedInputHeaders = Object.values(circuitTruthTable)[0]?.[0]?.slice(0, -1) || [];
  const inputLabels = answerInputHeaders.map((_, index) => String.fromCharCode(65 + index)); // Convert index to letters A, B, C, etc.

  // const getMatchColor = (answerKey, submittedKey) => {
  //   const match = matches.find(match => match.answerKey === answerKey && match.submittedKey === submittedKey);
  //   if (match) return "bg-green-100";
  //   if (unmatchedAnswers.includes(answerKey)) return "bg-red-100";
  //   if (unmatchedSubmissions.includes(submittedKey)) return "bg-yellow-100";
  //   return "";
  // };

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

  const showComparisonTable = answerKeys.length > 0 && submittedKeys.length > 0 && answerInputHeaders.length === submittedInputHeaders.length;

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
            Matching and mismatched entries are highlighted for easy identification.
          </p>
        </div>
        <div className="overflow-y-auto flex-grow mt-5">
          {showComparisonTable ? (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Comparison Table</h3>
              <table className="table-auto border-collapse border border-gray-400 w-full text-sm mb-4">
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
                    {matches.map(({ answerKey, submittedKey }, index) => (
                      <th
                        key={`match-${index}`}
                        className="border border-gray-400 px-4 py-2 whitespace-nowrap bg-green-100"
                      >
                        {`${answerKey} (Answer) - ${submittedKey} (Submitted)`}
                      </th>
                    ))}
                    {unmatchedAnswers.map((key, index) => (
                      <th
                        key={`unmatched-answer-${index}`}
                        className="border border-gray-400 px-4 py-2 whitespace-nowrap bg-red-100"
                      >
                        {`${key} (Answer)`}
                      </th>
                    ))}
                    {unmatchedSubmissions.map((key, index) => (
                      <th
                        key={`unmatched-submission-${index}`}
                        className="border border-gray-400 px-4 py-2 whitespace-nowrap bg-yellow-100"
                      >
                        {`${key} (Submitted)`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={`row-${rowIndex}`}>
                      {row.inputs.map((input, inputIndex) => (
                        <td
                          key={`input-${rowIndex}-${inputIndex}`}
                          className="border border-gray-400 px-4 py-2 text-center"
                        >
                          {input}
                        </td>
                      ))}
                      {matches.map(({ answerKey }, index) => (
                        <td
                          key={`match-${rowIndex}-${index}`}
                          className="border border-gray-400 px-4 py-2 text-center bg-green-100"
                        >
                          {row.answers[answerKey]}
                        </td>
                      ))}
                      {unmatchedAnswers.map((key, index) => (
                        <td
                          key={`unmatched-answer-${rowIndex}-${index}`}
                          className="border border-gray-400 px-4 py-2 text-center bg-red-100"
                        >
                          {row.answers[key]}
                        </td>
                      ))}
                      {unmatchedSubmissions.map((key, index) => (
                        <td
                          key={`unmatched-submission-${rowIndex}-${index}`}
                          className="border border-gray-400 px-4 py-2 text-center bg-yellow-100"
                        >
                          {row.submissions[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mb-8 text-center text-red-600">
              {answerKeys.length > 0 && submittedKeys.length > 0
                ? "The number of input signals in the answer table and the submitted table do not match."
                : "One or both of the tables are empty, so no comparison can be made."}
            </div>
          )}

          {answerKeys.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Answer Table</h3>
              <table className="table-auto border-collapse border border-gray-400 w-full text-sm mb-4">
                <thead className="sticky top-0 bg-gray-100 z-10">
                  <tr>
                    {inputLabels.map((label, index) => (
                      <th
                        key={`input-header-answer-${index}`}
                        className="border border-gray-400 px-4 py-2 whitespace-nowrap"
                      >
                        {label}
                      </th>
                    ))}
                    {answerKeys.map((key) => (
                      <th
                        key={`answer-${key}`}
                        className="border border-gray-400 px-4 py-2 whitespace-nowrap"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.values(answerTable)[0].map((row, rowIndex) => (
                    <tr key={`answer-row-${rowIndex}`}>
                      {row.slice(0, -1).map((input, inputIndex) => (
                        <td
                          key={`answer-input-${rowIndex}-${inputIndex}`}
                          className="border border-gray-400 px-4 py-2 text-center"
                        >
                          {input}
                        </td>
                      ))}
                      {answerKeys.map((key) => (
                        <td
                          key={`answer-${key}-${rowIndex}`}
                          className="border border-gray-400 px-4 py-2 text-center"
                        >
                          {answerTable[key][rowIndex][answerTable[key][rowIndex].length - 1]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {submittedKeys.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Submitted Table</h3>
              <table className="table-auto border-collapse border border-gray-400 w-full text-sm mb-4">
                <thead className="sticky top-0 bg-gray-100 z-10">
                  <tr>
                    {Object.values(circuitTruthTable)[0][0].slice(0, -1).map((_, index) => (
                      <th
                        key={`input-header-submitted-${index}`}
                        className="border border-gray-400 px-4 py-2 whitespace-nowrap"
                      >
                        {String.fromCharCode(65 + index)}
                      </th>
                    ))}
                    {submittedKeys.map((key) => (
                      <th
                        key={`submitted-${key}`}
                        className="border border-gray-400 px-4 py-2 whitespace-nowrap"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.values(circuitTruthTable)[0].map((row, rowIndex) => (
                    <tr key={`submitted-row-${rowIndex}`}>
                      {row.slice(0, -1).map((input, inputIndex) => (
                        <td
                          key={`submitted-input-${rowIndex}-${inputIndex}`}
                          className="border border-gray-400 px-4 py-2 text-center"
                        >
                          {input}
                        </td>
                      ))}
                      {submittedKeys.map((key) => (
                        <td
                          key={`submitted-${key}-${rowIndex}`}
                          className="border border-gray-400 px-4 py-2 text-center"
                        >
                          {circuitTruthTable[key][rowIndex][circuitTruthTable[key][rowIndex].length - 1]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4">
            <h4 className="text-lg font-bold text-gray-800">Summary</h4>
            <p className="text-gray-600 mt-1">
              <span className="bg-green-100 px-2 py-1 rounded">Green</span>: Matching outputs
            </p>
            <p className="text-gray-600 mt-1">
              <span className="bg-red-100 px-2 py-1 rounded">Red</span>: Unmatched outputs in the answer table
            </p>
            <p className="text-gray-600 mt-1">
              <span className="bg-yellow-100 px-2 py-1 rounded">Yellow</span>: Unmatched outputs in the submitted table
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareTruthTable;