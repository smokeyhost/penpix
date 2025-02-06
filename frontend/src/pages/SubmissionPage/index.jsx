import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatDueDateTime } from '../../utils/helpers';
import { FiCheckCircle } from 'react-icons/fi';
import { FaUserCircle } from "react-icons/fa";
import axios from 'axios';
import styles from './index.module.css'; 
import useTemplateDownloader from '../../hooks/useTemplateDownloader';
import useToast from '../../hooks/useToast';
import InvalidFilesList from './components/InvalidFilesList';

const SubmissionPage = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null); 
  const [files, setFiles] = useState({}); 
  const [isUploaded, setIsUploaded] = useState(false); 
  const [isPastDue, setIsPastDue] = useState(false);
  const [loading, setLoading] = useState(true);   
  const [isTaskNotFound, setIsTaskNotFound] = useState(false);
  const [owner, setOwner] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [invalidFiles, setInvalidFiles] = useState({ notEnrolled: [], notBelonging: [] });
  const [showInvalidFiles, setShowInvalidFiles] = useState(false);
  const { downloadTemplate } = useTemplateDownloader();
  const { toastSuccess, toastError, toastWarning } = useToast();

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

          // Fetch the task owner's information
          const ownerResponse = await axios.get(`/auth/user/${response.data.user_id}`);
          if (ownerResponse.data.user) {
            setOwner(ownerResponse.data.user);
          }

          // Fetch the class information
          const classResponse = await axios.get(`/classes/get-class/${response.data.class_id}`);
          if (classResponse.data) {
            setClassInfo(classResponse.data);
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
    const invalidFilenames = [];
    let hasFiles = false;
    setLoading(true);

    task.answer_keys.forEach((item, index) => {
      const file = files[index];
      if (file) {
        hasFiles = true;
        const filename = file.name;
        const regex = new RegExp(`^\\d+_${task.exam_type}\\[${index + 1}\\]\\.(png|jpg|jpeg|gif)$`, 'i');
        if (!regex.test(filename)) {
          invalidFilenames.push(filename);
        } else {
          formData.append('files', file);
          formData.append('item_number', index + 1);
        }
      }
    });
    
    if (!hasFiles) {
      toastWarning('No files selected for upload. Please choose files to upload.');
      return;
    }

    if (invalidFilenames.length > 0) {
      toastWarning(`The following files do not follow the proper naming convention: ${invalidFilenames.join(', ')}. Please rename them to follow the convention: id_typeOfActivity[#itemNumber].png`);
      return;
    }
    
    formData.append('task_id', task.id);
    try {
      const response = await axios.post('/files/upload-files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { files_uploaded, invalid_files_not_enrolled, invalid_files_not_belonging } = response.data;

      if (invalid_files_not_enrolled.length > 0 || invalid_files_not_belonging.length > 0) {
        setInvalidFiles({
          notEnrolled: invalid_files_not_enrolled,
          notBelonging: invalid_files_not_belonging,
        });
        setShowInvalidFiles(true);
      } else if (files_uploaded.length > 0) {
        toastSuccess('File(s) uploaded successfully!');
        setIsUploaded(true);
      } 
    } catch (error) {
      console.error('Error uploading files:', error);
      toastError('An error occurred during file upload.');
    } finally{
      setLoading(false);
    }
  };

  const closeInvalidFilesList = () => {
    setShowInvalidFiles(false);
    setInvalidFiles({ notEnrolled: [], notBelonging: [] });
  };

  if (isTaskNotFound) {
    return (
      <div className="p-10 w-full">
        <div className="flex items-center mb-5">
          <Link to="/"><img src="/icons/PenPix-txt.png" alt="Logo" /></Link>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-500">Task Not Found</h2>
          <p className="text-gray-600 mt-2">The task has been removed or is no longer available.</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <header className="w-full p-6 text-black">
        <div className="flex items-center mb-2">
          <Link to="/"><img src="/icons/PenPix-txt.png" alt="Logo" /></Link>
        </div>
        <h1 className="text-2xl font-bold text-center">Submission Page</h1>
      </header>
  
      <div className="p-10 w-full flex flex-col-reverse lg:flex-row gap-6">
        {/* Left Section */}
        <div className="lg:w-2/3">
          <div className={`${styles.taskDetails} bg-gray-100 p-6 rounded-lg mb-6 relative`}>
            <h2 className="text-xl font-semibold">{task.title || 'Task Title'}</h2>
            <p><strong>Exam Type:</strong> {task.exam_type.charAt(0).toUpperCase() + task.exam_type.slice(1) || 'Exam Type'}</p>
            <p><strong>Due Date:</strong> {formatDueDateTime(task.due_date) || 'Due Date'}</p>
          </div>
          <p
            className="text-blue-500 underline italic cursor-pointer"
            onClick={() => downloadTemplate(taskId)}
          >
            Download Template
          </p>
  
          <div className="mb-4 mt-4 text-sm text-gray-600">
            <p>
              <strong>Note:</strong> Please ensure your file names follow this convention: <code>id_typeOfActivity[#itemNumber].png</code>. 
              For example: <code>12345_{task.exam_type}[1].png</code>.
            </p>
          </div>
  
          {isPastDue ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-500">Submission Closed</h2>
              <p className="text-gray-600 mt-2">The due date for this task has passed. You can no longer submit files.</p>
            </div>
          ) : !isUploaded ? (
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
                    accept="image/*"
                  />
                </div>
              ))}
  
              <button
                type="submit"
                className={`${styles.uploadButton} bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600`}
              >
                {!loading ? "Submit Files" : "Uploading..."}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <FiCheckCircle className="text-green-500 text-6xl mb-4" />
              <h2 className="text-xl font-semibold">Files Uploaded Successfully!</h2>
              <p className="text-gray-600 mt-2">Thank you for your submission.</p>
            </div>
          )}
        </div>
  
        {/* Right Section */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          {owner && (
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="text-md font-medium mb-4">Teacher Information</h3>
              <div className="flex items-center gap-4">
                {owner.profile_image_url ? (
                  <img
                    src={owner.profile_image_url}
                    alt="Profile"
                    className="rounded-full w-16 h-16 object-cover"
                  />
                ) : (
                  <FaUserCircle size={50} color="gray" />
                )}
                <div>
                  <h2 className="text-lg font-semibold">{owner.name}</h2>
                  <p className="text-sm text-gray-600">{owner.email}</p>
                </div>
              </div>
            </div>
          )}
  
          {classInfo && (
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="text-md font-medium mb-4">Class Information</h3>
              <p><strong>Course Code:</strong> {classInfo.class_code}</p>
              <p><strong>Class Group:</strong> {classInfo.class_group}</p>
              <p><strong>Schedule:</strong> {classInfo.class_schedule}</p>
            </div>
          )}
        </div>
      </div>

      {/* Invalid Files List Section */}
      {showInvalidFiles && (
        <InvalidFilesList
          invalidFiles={invalidFiles}
          onClose={closeInvalidFilesList}
        />
      )}
    </div>
  );
};

export default SubmissionPage;