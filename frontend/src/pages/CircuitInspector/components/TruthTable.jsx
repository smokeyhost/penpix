import { useRef } from "react";
import * as htmlToImage from "html-to-image";
import { IoClose } from "react-icons/io5";

const TruthTable = ({ data, onClose }) => {
  const tableRef = useRef(null);

  if (!data || Object.keys(data).length === 0) {
    return <p className="text-center text-gray-600">No data provided</p>;
  }

  const saveAsCSV = () => {
    let csvContent = "";
    const inputCount = Object.values(data)[0][0].length - 1;
    const inputLabels = Array.from({ length: inputCount }, (_, i) => `X${i + 1}`);
    const outputLabels = Object.keys(data);

    csvContent += [...inputLabels, ...outputLabels].join(",") + "\n";

    const rowCount = Object.values(data)[0].length;

    for (let i = 0; i < rowCount; i++) {
      const row = Array.from({ length: inputCount }, (_, j) => data[outputLabels[0]][i][j]);
      outputLabels.forEach((key) => {
        row.push(data[key][i].slice(-1)[0]);
      });
      csvContent += row.join(",") + "\n";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "truth_table.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveAsPng = async () => {
    if (!tableRef.current) return;

    try {
      const dataUrl = await htmlToImage.toPng(tableRef.current);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.setAttribute("download", "truth_table.png");
      link.click();
    } catch (error) {
      console.error("Failed to save as PNG", error);
    }
  };

  const inputLabels = Array.from(
    { length: Object.values(data)[0][0].length - 1 },
    (_, i) => `X${i + 1}`
  );
  const outputLabels = Object.keys(data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-[90vw] h-[80vh] p-6 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 bg-gray-200 hover:bg-gray-300 rounded-full p-2"
        >
          <IoClose size={24} />
        </button>

        <h2 className="text-center text-xl font-bold mb-4">Truth Table</h2>

        <div className="overflow-auto max-h-[calc(100%-80px)]">
          <table ref={tableRef} className="table-auto border-collapse border border-gray-400 w-full text-sm">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                {inputLabels.map((label, index) => (
                  <th key={index} className="border border-gray-400 px-4 py-2 whitespace-nowrap">
                    {label}
                  </th>
                ))}
                {outputLabels.map((label) => (
                  <th key={label} className="border border-gray-400 px-4 py-2 whitespace-nowrap">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(data)[0].map((rowData, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-gray-50" : "bg-gray-200"}>
                  {rowData.slice(0, -1).map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border border-gray-400 px-4 py-2 text-center"
                    >
                      {cell}
                    </td>
                  ))}
                  {outputLabels.map((key) => (
                    <td
                      key={`${key}-${rowIndex}`}
                      className="border border-gray-400 px-4 py-2 text-center"
                    >
                      {data[key][rowIndex].slice(-1)[0]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4 space-x-4">
          <button
            onClick={saveAsCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
          >
            Save as CSV
          </button>
          <button
            onClick={saveAsPng}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700"
          >
            Save as PNG
          </button>
        </div>
      </div>
    </div>
  );
};

export default TruthTable;
