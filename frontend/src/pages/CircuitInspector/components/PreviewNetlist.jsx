const PreviewNetlist = ({ netlistContent, onClose, onDownload }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[60vw] max-h-[80vh] overflow-auto shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-center">Preview Netlist</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
          {netlistContent}
        </pre>
        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={onClose}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
          >
            Close
          </button>
          <button
            onClick={onDownload}
            className="bg-gray-800 text-white py-2 px-4 rounded hover:shadow-md transition"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewNetlist;
