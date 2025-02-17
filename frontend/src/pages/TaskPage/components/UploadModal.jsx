import { useState } from "react";
import useToast from '../../../hooks/useToast';

const UploadModal = ({ isOpen, onClose, items, onUploadFiles, task, uploading }) => {
  const [fileMappings, setFileMappings] = useState({});
  const { toastWarning, toastError } = useToast();

  const handleFileChange = (e, index) => {
    setFileMappings({
      ...fileMappings,
      [index + 1]: e.target.files,
    });
  };

  const handleUpload = () => {
    const allFiles = Object.entries(fileMappings);
    const invalidFilenames = [];

    if (allFiles.length === 0) {
      toastWarning("Please upload files for at least one item.");
      return;
    }

    allFiles.forEach(([itemNumber, files]) => {
      const validFiles = Array.from(files).filter((file) => {
        const filename = file.name;
        const regex = new RegExp(`^\\d+_${task.exam_type}\\[${itemNumber}\\]\\.(png|jpg|jpeg|pdf|gif)$`, 'i');
        if (!regex.test(filename)) {
          invalidFilenames.push(filename);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        onUploadFiles(parseInt(itemNumber), validFiles);
      }
    });

    if (invalidFilenames.length > 0) {
      toastError(`The following files do not follow the proper naming convention: ${invalidFilenames.join(', ')}. Please rename them to follow the convention: id_number_typeOfActivity[#itemNumber].png/jpg/jpeg/pdf`);
    }

  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg md:w-3/4 lg:w-1/2">
        <h2 className="text-xl font-bold mb-4">Upload Files</h2>
        <div className="mb-4 text-sm text-gray-600">
          <p>
            <strong>Note:</strong> Please ensure your file names follow this convention: <code>id_number_typeOfActivity[#itemNumber].png</code>. 
            For example: <code>12345_{task.exam_type}[1].png</code>.
          </p>
        </div>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <span className="font-medium">{`Item ${index + 1}:`}</span>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileChange(e, index)}
                className="w-full md:w-auto flex-grow p-2 border rounded-md"
                accept="image/*, application/pdf"
              />
              {/* {fileMappings[index + 1] && (
                <div className="text-sm text-gray-500 truncate max-w-full md:max-w-xs overflow-hidden text-ellipsis">
                  {Array.from(fileMappings[index + 1]).map(file => file.name).join(', ')}
                </div>
              )} */}
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {!uploading ? "Upload Files":"Uploading..."}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
