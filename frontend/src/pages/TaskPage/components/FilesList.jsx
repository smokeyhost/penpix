import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from "../../../contexts/ConfirmContext";
import useToast from '../../../hooks/useToast';

const FilesList = ({ files, refreshFiles, task }) => {
  const [sortOption, setSortOption] = useState('desc');
  const [filterOption, setFilterOption] = useState('all');
  const [similarFiles, setSimilarFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filesPerPage] = useState(5);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { toastInfo } = useToast();

  useEffect(() => {
    const storedSimilarFiles = JSON.parse(sessionStorage.getItem('similarFiles')) || [];
    setSimilarFiles(storedSimilarFiles);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('similarFiles', JSON.stringify(similarFiles));
  }, [similarFiles]);

  const calculateTotalGrade = () => {
    const grades = {};
    task?.answer_keys?.forEach((item) => {
      const totalGrade = item.keys.reduce((sum, key) => sum + (parseInt(key.grade, 10) || 0), 0);
      grades[item.item] = totalGrade;
    });
    return grades;
  };

  const totalGrades = calculateTotalGrade();

  const handleDeleteFile = async (event, fileId) => {
    event.preventDefault();

    const isConfirmed = await confirm('This submission will be completely removed from the system. Are you sure you want to delete this file?', false, '');
    if (!isConfirmed) return;

    try {
      await axios.delete(`/files/delete-file/${fileId}`);
      refreshFiles();
      setSimilarFiles((prev) => prev.filter((id) => id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('An error occurred while deleting the file.');
    }
  };

  const handleComparePredictions = async () => {
    const marginOfError = 20; // Margin of error for position and confidence level
  
    const arePredictionsSimilar = (pred1, pred2) => {
      return (
        pred1.class_id === pred2.class_id &&
        Math.abs(pred1.x - pred2.x) <= marginOfError &&
        Math.abs(pred1.y - pred2.y) <= marginOfError &&
        Math.abs(pred1.confidence - pred2.confidence) <= marginOfError / 100
      );
    };
  
    const areAllPredictionsSimilar = (predictions1, predictions2) => {
      if (predictions1.length !== predictions2.length) return false;
  
      for (let i = 0; i < predictions1.length; i++) {
        if (!arePredictionsSimilar(predictions1[i], predictions2[i])) {
          return false;
        }
      }
      return true;
    };
  
    try {
      const predictionsMap = new Map();
      const similarFileIds = [];
  
      for (const file of files) {
        const response = await axios.get(`/detect-gates/get-circuit-data/${file.id}`);
        const { circuit_analysis } = response.data;
  
        if (circuit_analysis && circuit_analysis.predictions) {
          const predictions = circuit_analysis.predictions;
          console.log(`File ID: ${file.id}, Predictions:`, predictions);
  
          let foundSimilar = false;
          for (const [key, value] of predictionsMap.entries()) {
            if (areAllPredictionsSimilar(predictions, key)) {
              value.push(file.id);
              foundSimilar = true;
              break;
            }
          }
  
          if (!foundSimilar) {
            predictionsMap.set(predictions, [file.id]);
          }
        }
      }
  
      predictionsMap.forEach((ids) => {
        if (ids.length > 1) {
          similarFileIds.push(...ids);
        }
      });
  
      if (similarFileIds.length === 0) {
        toastInfo('No similarities found.');
      } else {
        setSimilarFiles(similarFileIds);
        toastInfo('Similarities detected in submissions.');
      }
    } catch (error) {
      console.error('Error comparing predictions:', error);
      toastInfo('An error occurred while comparing predictions.', 'error');
    }
  };

  const filteredFiles = files
    .filter((file) => {
      if (filterOption === 'graded') return file.graded;
      if (filterOption === 'ungraded') return !file.graded;
      if (filterOption === 'similar') return similarFiles.includes(file.id);
      return true;
    })
    .sort((a, b) => {
      return sortOption === 'asc'
        ? a.total_grade - b.total_grade
        : b.total_grade - a.total_grade;
    });

  const groupedFiles = filteredFiles.reduce((acc, file) => {
    if (!acc[file.item_number]) acc[file.item_number] = [];
    acc[file.item_number].push(file);
    return acc;
  }, {});

  const formatFilename = (filename) => filename.replace(/\.[^/.]+$/, '');

  const renderEmptyMessage = () => {
    if (filterOption === 'graded') {
      return <p className="text-yellow-600 text-sm">All files are not yet graded.</p>;
    }
    if (filterOption === 'ungraded') {
      return <p className="text-yellow-600 text-sm">All files are already graded.</p>;
    }
    if (filterOption === 'similar') {
      return <p className="text-yellow-600 text-sm">No similar files. Click Check for similar submissions button.</p>;
    }
    return <p className="text-sm">No submissions available.</p>;
  };

  const handleNavigate = (fileIndex) => {
    sessionStorage.setItem("fileIndex", JSON.stringify(fileIndex));
    navigate(`/circuit-evaluator/${task.id}`);
  };

  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = similarFiles.slice(indexOfFirstFile, indexOfLastFile);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bg-white shadow-md p-4 rounded-md">
      <h2 className="text-lg font-semibold mb-3">Submissions</h2>

      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4">
        <div>
          <label className="font-medium mr-2 text-sm">Sort by Grade:</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border rounded px-2 py-1 w-full sm:w-auto text-sm"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        <div>
          <label className="font-medium mr-2 text-sm">Filter:</label>
          <select
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="border rounded px-2 py-1 w-full sm:w-auto text-sm"
          >
            <option value="all">All</option>
            <option value="graded">Graded</option>
            <option value="ungraded">Ungraded</option>
            <option value="similar">Similar</option>
          </select>
        </div>
        <button
          onClick={handleComparePredictions}
          className="bg-primaryColor text-white px-4 py-2 rounded"
        >
          Check For Similar Submissions
        </button>
      </div>

      {filterOption === 'all' && similarFiles.length > 0 && (
        <p className="text-red-600 text-sm mb-4">
          Reminder: If you filter all submissions, click the Check For Similar Submissions button again to refresh the similar files data.
        </p>
      )}

      {filterOption === 'similar' && similarFiles.length > 0 && (
        <div className="mb-4">
          <h3 className="text-md font-medium mb-2">Similar Files</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {currentFiles.map((fileId) => {
              const file = files.find((f) => f.id === fileId);
              return (
                <div key={file.id} className="border p-2 rounded">
                  <img src={file.file_url} alt={file.filename} className="w-full h-48 object-cover mb-2" />
                  <p className="text-sm">{file.filename}</p>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-l bg-gray-200 hover:bg-gray-300"
            >
              Previous
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={indexOfLastFile >= similarFiles.length}
              className="px-3 py-1 border rounded-r bg-gray-200 hover:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {Object.keys(groupedFiles).length === 0 ? (
        renderEmptyMessage()
      ) : (
        Object.entries(groupedFiles).map(([itemNumber, files]) => (
          <div key={itemNumber} className="mb-4">
            <h3 className="text-md font-medium mb-2">
              Item {itemNumber} - Total Grade: {totalGrades[`Item ${itemNumber}`] || 0}
            </h3>
            <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1 text-left w-[30%]">Filename</th>
                  <th className="border border-gray-300 px-2 py-1 hidden sm:table-cell w-[20%]">Status</th>
                  <th className="border border-gray-300 px-2 py-1 w-[20%]">Total Grade</th>
                  <th className="border border-gray-300 px-2 py-1 w-[30%]">Action</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, index) => (
                  <tr
                    key={file.id}
                    className={`text-center ${similarFiles.includes(file.id) ? 'bg-yellow-100' : ''}`}
                  >
                    <td
                      className="border border-gray-300 px-2 py-1 text-left truncate"
                      style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      <span
                        className="text-blue-500 hover:underline cursor-pointer"
                        title={formatFilename(file.filename)}
                        onClick={() => handleNavigate(index)}
                      >
                        {formatFilename(file.filename)}
                      </span>
                    </td>
                    <td
                      className={`border border-gray-300 px-2 py-1 hidden sm:table-cell ${
                        file.graded ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {file.graded ? 'Graded' : 'Not graded'}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {file.graded ? `${file.total_grade} / ${totalGrades[`Item ${itemNumber}`] || 0}` : '—'}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <button onClick={(e) => handleDeleteFile(e, file.id)} className="text-red-500 hover:text-red-700">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default FilesList;