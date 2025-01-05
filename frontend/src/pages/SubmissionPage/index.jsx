import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatDueDateTime } from '../../utils/helpers';
import { FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import styles from './index.module.css'; 

const SubmissionPage = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null); 
  const [files, setFiles] = useState({}); 
  const [isUploaded, setIsUploaded] = useState(false); 
  const [isPastDue, setIsPastDue] = useState(false);
  const [isTaskNotFound, setIsTaskNotFound] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(`/task/get-task/${taskId}`);
        if (response.data) {
          setTask(response.data);
          const dueDate = new Date(response.data.due_date); 
          const currentDate = new Date();

          if (currentDate > dueDate) {
            setIsPastDue(true); 
          }
        } else {
          setIsTaskNotFound(true); // Set the flag if task data is missing
          console.error('Task not found or incorrect data format');
        }
      } catch (error) {
        setIsTaskNotFound(true); // Set the flag if there is an error fetching task
        console.error('Error fetching task:', error);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleFileChange = (itemIndex, event) => {
    const updatedFiles = { ...files };
    updatedFiles[itemIndex] = event.target.files[0]; 
    setFiles(updatedFiles);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    task.answer_keys.forEach((item, index) => {
      const file = files[index];
      if (file) {
        formData.append('files', file);
        formData.append('item_number', index + 1);
      }
    });
    formData.append('task_id', task.id);
    try {
      const response = await axios.post('/files/upload-files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { files_uploaded, skipped_files, invalid_files } = response.data;

      if (invalid_files.length > 0) {
        alert(`The following files were rejected because their names don't match students in the class: ${invalid_files.join(', ')}`);
      } else if (files_uploaded.length > 0) {
        alert('File(s) uploaded successfully!');
        setIsUploaded(true);
      } else if (skipped_files.length > 0) {
        alert(`Some files were skipped because they already exist: ${skipped_files.join(', ')}`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('An error occurred during file upload.');
    }
  };

  if (isTaskNotFound) {
    return (
      <div className="p-10 w-full">
        <div className="flex items-center mb-5">
          <Link to="/"><img src="/icons/PenPix-txt.png" alt="Logo" /></Link>
        </div>
        <h1 className="text-lg font-bold text-center">Submission Page</h1>
        <div className={`${styles.app} bg-white p-6 rounded-lg shadow-md`}>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-500">Task Not Found</h2>
            <p className="text-gray-600 mt-2">The task has been removed or is no longer available.</p>
            {/* <Link to="/" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              Go to Home
            </Link> */}
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-10 w-full">
      <div className="flex items-center mb-5">
        <Link to="/"><img src="/icons/PenPix-txt.png" alt="Logo" /></Link>
      </div>
      <h1 className="text-lg font-bold text-center">Submission Page</h1>
      <div className={`${styles.app} bg-white p-6 rounded-lg shadow-md`}>
        {isPastDue ? (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-500">Submission Closed</h2>
            <p className="text-gray-600 mt-2">The due date for this task has passed. You can no longer submit files.</p>
            {/* <Link to="/" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              Go to Home
            </Link> */}
          </div>
        ) : !isUploaded ? (
          <>
            <div className={`${styles.taskDetails} mb-5`}>
              <h2 className="text-xl font-semibold">{task.title || 'Task Title'}</h2>
              <p><strong>Exam Type:</strong> {task.exam_type.charAt(0).toUpperCase() + task.exam_type.slice(1) || 'Exam Type'}</p>
              <p><strong>Due Date:</strong> {formatDueDateTime(task.due_date) || 'Due Date'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {task.answer_keys?.map((item, index) => (
                <div key={index} className="mb-4">
                  <label className="block font-semibold mb-2">
                    {item.item || `Item ${index + 1}`}
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(index, e)}
                    className={`${styles.uploadInput} block w-full`}
                    accept="application/pdf,image/*"
                  />
                </div>
              ))}

              <button
                type="submit"
                className={`${styles.uploadButton} bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600`}
              >
                Submit Files
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <FiCheckCircle className="text-green-500 text-6xl mb-4" />
            <h2 className="text-2xl font-bold text-green-500">Files uploaded successfully!</h2>
            <p className="text-gray-600 mt-2">Ask the teacher to double-check your submission.</p>
            {/* <Link to="/" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              Go to Home
            </Link> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionPage;
