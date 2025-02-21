import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskItem from "./TaskItem";
import { formatDueDateTime, truncateText } from "../../../utils/helpers";
import useDeleteTask from '../../../hooks/useDeleteTask';
import useToast from "../../../hooks/useToast";
import TaskLinkModal from "./TaskLinkModal";
import useTemplateDownloader from "../../../hooks/useTemplateDownloader";

const TaskList = ({ filter, tasks, classList, refreshTasks, loading}) => {
  const { downloadTemplate } = useTemplateDownloader();
  const [openTask, setOpenTask] = useState(null);
  const [modalTaskId, setModalTaskId] = useState(null);
  const navigate = useNavigate();
  const { handleDeleteTask: deleteTask } = useDeleteTask();
  const menuRefDesktop = useRef(null);
  const menuRefMobile = useRef(null);
  const {toastSuccess, toastInfo} = useToast()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (menuRefDesktop.current && !menuRefDesktop.current.contains(event.target)) &&
        (menuRefMobile.current && !menuRefMobile.current.contains(event.target))
      ) {
        setOpenTask(null);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredTasks =
    tasks &&
    tasks.filter((task) => {
      if (filter === "All") return true;
      return task?.status === filter;
    });

  const handleMenu = (event, task) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenTask((prevTaskId) => (prevTaskId === task ? null : task));
  };

  const handleSelectedTask = (taskId) => {
    if (!modalTaskId) {
      navigate(`/task/${taskId}`);
    }
  };

  const handleDeleteTask = async (event, taskId) => {
    event.stopPropagation();
    const isDeleted = await deleteTask(taskId);
    if (!isDeleted) return;
    refreshTasks();
  };

  const handleShowLinkModal = (event, taskId) => {
    event.stopPropagation();
    setModalTaskId(taskId);
  };

  const handleCloseModal = () => {
    setModalTaskId(null);
  };

  const handleGetTemplate = async (event, taskId) => {
    event.stopPropagation();
    toastInfo("Requesting for the template. Please wait")
    await downloadTemplate(taskId)
    toastSuccess("Template is being downloaded")
  };

  const getGradedFilesCount = (task) => {
    return task?.files?.filter(file => file.graded).length || 0;
  }

  return (
    <div className="w-full h-full">
      <div className="max-w-7xl mx-auto px-4 py-7 max-md:hidden">
        <div className="grid grid-cols-7 gap-4 font-semibold text-sm border-b-2 pb-2">
          <div className="text-left text-gray-500">Course | Group</div>
          <div className="text-left col-span-2">Title</div>
          <div className="text-center">Graded Submissions</div>
          <div className="text-center">Due Date</div>
          <div className="text-center">Type of Task</div>
          <div className="text-right pr-3"></div>
        </div>

        {
          classList && tasks &&
          filteredTasks.map((task) => (
            <div
              key={task?.id}
              className="grid grid-cols-7 gap-4 text-sm border-b py-5 hover:bg-gray-200 rounded-b-sm cursor-pointer items-center relative"
              onClick={() => handleSelectedTask(task?.id)}
            >
              <TaskItem task={task} onHandleMenu={handleMenu} classList={classList} loading={loading}/>
              {openTask === task && (
                <div className="absolute right-0 top-0 mt-8" ref={menuRefDesktop}>
                  <div className="absolute h-fit right-0 -bottom-32 bg-white border border-gray-300 shadow-lg rounded-md p-2 w-48 z-50 max-md:top-8 max-md:right-3">
                    <ul className="space-y-2">
                      <li>
                        <button
                          className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md"
                          onClick={(event) => handleShowLinkModal(event, task.id)}
                        >
                          Generate Link
                        </button>
                      </li>
                      <li>
                        <button
                          className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md"
                          onClick={(event) => handleGetTemplate(event, task.id)}
                        >
                          Get Template
                        </button>
                      </li>
                      <li>
                        <button
                          className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md"
                          onClick={(event) => handleDeleteTask(event, task.id)}
                        >
                          Remove Task
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))
        }
      </div>

      <div className="hidden max-md:block">
        {
          tasks &&
          filteredTasks.map((task) => (
            <div
              key={task?.id}
              className="border border-gray-300 rounded-lg p-4 mb-4 hover:bg-gray-100 cursor-pointer mt-5 relative shadow-sm"
              onClick={() => handleSelectedTask(task?.id)}
            >
              <h3 className="font-semibold text-lg">
                {truncateText(task?.title, 20)}
              </h3>
              <p className="text-gray-600">
                Due Date: {formatDueDateTime(task?.due_date)}
              </p>
              <p
                className={`font-semibold ${
                  task?.status === "Ongoing" ? "text-red-500" : "text-green-500"
                }`}
              >
                Status: {task?.status}
              </p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm">
                  Submissions: {getGradedFilesCount()}/{task?.total_submissions}
                </p>
                <button
                  className="text-gray-500"
                  onClick={(event) => handleMenu(event, task)}
                >
                  <div className="absolute w-10 top-2 right-0">
                    <img src="/icons/meatballs_menu.svg" alt="Menu icon" />
                  </div>
                </button>
              </div>
              {openTask === task && (
                <div className="absolute right-0 top-0" ref={menuRefMobile}>
                  <div className="absolute h-fit right-0 -bottom-32 bg-white border border-gray-300 shadow-lg rounded-md p-2 w-48 z-50 max-md:top-8 max-md:right-3">
                    <ul className="space-y-2">
                      <li>
                        <button
                          className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md"
                          onClick={(event) =>
                            handleShowLinkModal(event, task.id)
                          }
                        >
                          Generate Link
                        </button>
                      </li>
                      <li>
                        <button
                          className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md"
                          onClick={(event) => handleGetTemplate(event, task.id)}
                        >
                          Get Template
                        </button>
                      </li>
                      <li>
                        <button
                          className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md"
                          onClick={(event) => handleDeleteTask(event, task.id)}
                        >
                          Remove Task
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))
        }
      </div>

      {modalTaskId && (
        <TaskLinkModal
          isOpen={!!modalTaskId}
          taskId={modalTaskId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default TaskList;
