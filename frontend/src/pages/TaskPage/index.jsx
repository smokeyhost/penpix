import TaskActions from './components/TaskActions';
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from 'recoil';
import { UserAtom } from '../../atoms/UserAtom';
import { FilesAtom } from '../../atoms/FilesAtom'
import FilesList from './components/FilesList';
import { formatDueDateTime } from '../../utils/helpers';
import useDeleteTask from '../../hooks/useDeleteTask';
import useClassData from '../../hooks/useClassData';
import TaskLinkModal from './components/TaskLinkModal'; 
import UploadModal from "./components/UploadModal";
import useToast from "../../hooks/useToast";
import useGetTask from "../../hooks/useGetTask"
import useTemplateDownloader from "../../hooks/useTemplateDownloader"

const TaskPage = () => {
  const [task, setTask] = useState({});
  const [files, setFiles] = useRecoilState(FilesAtom);
  const [isModalOpen, setModalOpen] = useState(false); 
  const [modalData, setModalData] = useState(null); 
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const currentUser = useRecoilValue(UserAtom);
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { classData, loading } = useClassData(taskId);
  const { handleDeleteTask: deleteTask } = useDeleteTask();
  const {toastSuccess, toastError} = useToast()
  const {downloadTemplate} = useTemplateDownloader(); 
  const { getTask } = useGetTask()

  const items = task.answer_keys?.map((key) => key.item) || [];
  
  const fetchFiles = useCallback(async () => {
    try {
      const response = await axios.get(`/files/get-files/${taskId}`);
      setFiles(response.data.files);
      console.log(response.data.files);
    } catch (error) {
      console.log(error);
    }
  }, [taskId, setFiles]);

  useEffect(() => {

    const getSelectedTask = async () => {
      try {
        if (taskId){
          const task = await getTask(taskId)
          setTask(task);
          console.log(task);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getSelectedTask();
    fetchFiles(); 

  }, [taskId, fetchFiles]);

  const handleUploadFiles = async (item, files) => {
    const formData = new FormData();
  
    files.forEach((file) => formData.append("files", file));
  
    formData.append("task_id", taskId);
    formData.append("item_number", item); 
  
    // for (let pair of formData.entries()) {
    //   console.log(`${pair[0]}:`, pair[1]);
    // }
  
    try {
      const response = await axios.post("/files/upload-files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true, 
      });
      
      if(response.data.invalid_files.length > 0){
        toastError(`Student Id(s) not enrolled in the class: ${response.data.invalid_files} `)
      }else{
        toastSuccess("Files Uploaded Successfully.")
      }
      fetchFiles();
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("An error occurred while uploading the files. Please try again.");
    }
  };
  

  const handleEditTask = () => {
    navigate(`/edit-task/${task?.id}`);
  };

  const handleDeleteTask = async (event) => {
    event.preventDefault()
    const isDeleted = await deleteTask(taskId);
    if (!isDeleted) return
    navigate(`/dashboard/${currentUser.id}`);
  };

  const handleAnalyzeSubmission = () => {
    navigate(`/circuit-evaluator/${task.id}`);
  };

  const refreshFiles = () => {
    fetchFiles();
  };

  const handleGetLink = () => {
    setModalData(task.id); 
    setModalOpen(true); 
  };

  const handleGetTemplate = () => {
    downloadTemplate(task.id)
  }

  const closeModal = () => {
    setModalOpen(false);
    setModalData(null);
  };

  if (loading) return;
  return (
    <div className="bg-[#EFEFEF] min-h-screen w-full p-4 sm:p-6 md:p-10">
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Task Details Section */}
        <div className="lg:col-span-2 bg-white shadow-lg p-4 md:p-6 rounded-lg">
          <div className="space-y-4">
            <h1 className="text-lg md:text-xl font-bold">{task.title}</h1>
            <p className="text-sm md:text-base">{task.description}</p>
            <div className="text-gray-500 text-sm md:text-base space-y-1">
              <p>Class: {classData?.class_code} | {classData?.class_group}</p>
              <p>Type: {task.exam_type}</p>
              <p>Class Schedule: {classData?.class_schedule}</p>
              <p>Updated At: {formatDueDateTime(task.updated_at)}</p>
              <p>Due Date: {formatDueDateTime(task.due_date)}</p>
              <p>Status: {task.status}</p>
              <p>Submissions: {files.length}</p>
            </div>

            {/* Answer Keys Section */}
            <div className="space-y-2">
              <label className="font-semibold text-sm md:text-base">Answer Keys:</label>
              <ul className="pl-4 space-y-2 text-gray-500 text-sm md:text-base">
                {task.answer_keys?.map((answerKey, index) => (
                  <li key={index} className="space-y-1">
                    <span className="font-semibold">{answerKey['item']}:</span>
                    <ul className="pl-6 space-y-1">
                      {answerKey['keys'].map((key, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <div>
                            <span className="font-semibold">Expression: </span>
                            <span>{key['expression']}</span>
                          </div>
                          <div>
                            <span className="font-semibold">Grade: </span>
                            <span>{key['grade']}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Task Actions Section */}
        <TaskActions
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          openUploadModal={() => setUploadModalOpen(true)}
          onAnalyze={handleAnalyzeSubmission}
          onGetLink={handleGetLink}
          openGetTemplate={handleGetTemplate}
        />
      </div>

      {/* Files List Section */}
      <div className="w-full bg-white shadow-lg p-4 mt-4 md:mt-6 rounded-lg">
        <FilesList files={files} refreshFiles={refreshFiles} task={task}/>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <TaskLinkModal
          isOpen={isModalOpen}
          onClose={closeModal}
          taskId={modalData}
        />
      )}
      {isUploadModalOpen && (
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          items={items}
          onUploadFiles={handleUploadFiles}
        />
      )}
    </div>

  );
};

export default TaskPage;
