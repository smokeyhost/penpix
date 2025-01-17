import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskMenu from "./TaskMenu";
import TaskItem from "./TaskItem";
import { formatDueDateTime, truncateText } from "../../../utils/helpers";
import useDeleteTask from '../../../hooks/useDeleteTask';
import TaskLinkModal from "./TaskLinkModal";
import useTemplateDownloader from "../../../hooks/useTemplateDownloader";

const TaskList = ({ filter, tasks, refreshTasks }) => {
  const {downloadTemplate} = useTemplateDownloader();
  const [openTask, setOpenTask] = useState(null);
  const [modalTaskId, setModalTaskId] = useState(null);
  const navigate = useNavigate();
  const { handleDeleteTask: deleteTask } = useDeleteTask();

  const filteredTasks = tasks.filter((task) => {
    if (filter === "All") return true;
    return task.status === filter;
  });

  const handleMenu = (event, task) => {
    event.stopPropagation();
    setOpenTask((prevTaskId) => (prevTaskId === task ? null : task));
  };

  const handleSelectedTask = (taskId) => {
    if (!modalTaskId) {
      navigate(`/task/${taskId}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const isDeleted = await deleteTask(taskId);
    if (!isDeleted) return
    refreshTasks();
  };

  const handleShowLinkModal = (event, taskId) => {
    event.stopPropagation(); // Prevent parent click
    setModalTaskId(taskId);
  };

  const handleCloseModal = () => {
    setModalTaskId(null);
  };

  const handleGetTemplate = async (event, taskId) => {
    event.stopPropagation();
    downloadTemplate(taskId)
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-7 max-md:hidden">
        <div className="grid grid-cols-7 gap-4 font-semibold text-sm border-b-2 pb-2">
          <div className="text-left text-gray-500">Course | Group</div>
          <div className="text-left col-span-2">Title</div>
          <div className="text-center ">Graded Submissions</div>
          <div className="text-center ">Due Date</div>
          <div className="text-center ">Type of Task</div>
          <div className="text-right  pr-3"></div>
        </div>
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="grid grid-cols-7 gap-4 text-sm border-b py-5 hover:bg-gray-200 rounded-b-sm cursor-pointer items-center relative"
            onClick={() => handleSelectedTask(task.id)}
          >
            <TaskItem task={task} />
            <button
              className="text-right col-span-1 pr-4"
              onClick={(event) => handleMenu(event, task)}
            >
              <img className="inline-block" src="/icons/meatballs_menu.svg" alt="Menu icon" />
            </button>
            {openTask === task && (
              <TaskMenu
                onDelete={() => handleDeleteTask(task.id)}
                onGetLink={(event) => handleShowLinkModal(event, task.id)}
                onGetTemplate={(event) => handleGetTemplate(event, task.id)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="hidden max-md:block">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="border border-gray-300 rounded-lg p-4 mb-4 hover:bg-gray-100 cursor-pointer mt-5 relative"
            onClick={() => handleSelectedTask(task.id)}
          >
            <h3 className="font-semibold text-lg">{truncateText(task.title, 20)}</h3>
            <p className="text-gray-600">Due Date: {formatDueDateTime(task.due_date)}</p>
            <p
              className={`font-semibold ${
                task.status === "Ongoing" ? "text-red-500" : "text-green-500"
              }`}
            >
              Status: {task.status}
            </p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm">
                Submissions: {task.reviewed_submissions}/{task.total_submissions}
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
              <TaskMenu
                onDelete={() => handleDeleteTask(task.id)}
                onGetLink={(event) => handleShowLinkModal(event, task.id)}
              />
            )}
          </div>
        ))}
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
