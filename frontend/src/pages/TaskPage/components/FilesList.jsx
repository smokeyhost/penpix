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
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { toastInfo } = useToast();

  useEffect(() => {
    const storedSimilarFiles = JSON.parse(localStorage.getItem('similarFiles')) || [];
    setSimilarFiles(storedSimilarFiles);
  }, []);

  useEffect(() => {
    localStorage.setItem('similarFiles', JSON.stringify(similarFiles));
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
    try {
      const predictionsMap = new Map();
      const similarFileIds = [];

      for (const file of files) {
        const response = await axios.get(`/detect-gates/get-circuit-data/${file.id}`);
        const { circuit_analysis } = response.data;

        if (circuit_analysis && circuit_analysis.predictions) {
          const key = JSON.stringify(circuit_analysis.predictions);
          if (predictionsMap.has(key)) {
            predictionsMap.get(key).push(file.id);
          } else {
            predictionsMap.set(key, [file.id]);
          }
        }
      }

      predictionsMap.forEach((ids) => {
        if (ids.length > 1) {
          similarFileIds.push(...ids);
        }
      });

      if (similarFileIds.length === 0) {
        toastInfo('No predictions to compare.');
      } else {
        setSimilarFiles(similarFileIds);
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
      return <p className="text-yellow-600 text-sm">No graded submissions to compare.</p>;
    }
    return <p className="text-sm">No submissions available.</p>;
  };

  const handleNavigate = (fileIndex) => {
    localStorage.setItem("fileIndex", JSON.stringify(fileIndex));
    navigate(`/circuit-evaluator/${task.id}`);
  };

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
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Check For Similar Submissions
        </button>
      </div>

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