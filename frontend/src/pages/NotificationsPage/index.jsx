import { IoIosClose } from "react-icons/io";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { FaRegBellSlash } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import useErrorHandler from '../../hooks/useErrorHandler';
import useGetClasses from "../../hooks/useGetClasses";
import { useConfirm } from "../../contexts/ConfirmContext";
import { formatDueDateTime} from "../../utils/helpers";
import { Link, useNavigate } from "react-router-dom";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const confirm = useConfirm()
  const { getClasses } = useGetClasses();
  const [classes, setClasses] = useState([]); 
  const { handleError } = useErrorHandler();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage] = useState(8);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {  
      const fetchedClasses = await getClasses();
      setClasses(fetchedClasses);
    }
    fetchClasses()
  },[])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/notification/get-all-notifications');
        const fetchedNotifications = response.data.notifications;
        const sortedNotifications = fetchedNotifications.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setNotifications(sortedNotifications);
      } catch (error) {
        if (error.response?.status === 401) {
          handleError('unauthorized', 'Unable to fetch notifications, please log in again.');
        } else if (error.response?.status === 404) {
          handleError('404', 'No notifications found.');
        } else {
          handleError('default', 'An error occurred while fetching notifications.');
        }
      }
    };
    
    const fetchTasks = async () => {
      try {
        const response = await axios.get('/task/get-tasks');
        setTasks(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          handleError('unauthorized', 'Your session has expired. Login again.');
        } else if (error.response?.status === 404) {
          handleError('404', 'The resource you are looking for could not be found.');
        } else {
          handleError('default', 'An unexpected error occurred.');
        }
      }
    };

    fetchNotifications();
    fetchTasks();
  }, []);

  useEffect(() => {
    const removeOldNotifications = async () => {
      const now = new Date();
      const fourteenDaysAgo = new Date(now.setDate(now.getDate() - 14));

      notifications.forEach(async (notification) => {
        if (new Date(notification.created_at) < fourteenDaysAgo) {
          await axios.delete(`/notification/delete-notification/${notification.id}`);
          setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        }
      });
    };
    removeOldNotifications();
  }, [notifications]);

  const totalPages = Math.ceil(notifications.length / notificationsPerPage);
  const currentNotifications = notifications.slice(
    (currentPage - 1) * notificationsPerPage,
    currentPage * notificationsPerPage
  );

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDeleteAll = async () => {
    const isDelete = await confirm("Are you sure you want to delete all notifications?")
    if (!isDelete) return;
  
    try {
      await axios.delete("/notification/delete-all-notifications");
      setNotifications([]);
    } catch (error) {
      handleError("default", "Failed to delete notifications.");
      console.log(error)
    }
  };

  const getTaskDisplay = (taskId) => {
    const task = tasks.find((task) => task.id === taskId);
    if (!task) return 'Unknown Task';
    
    const taskTitle = task.title;
    
    const classInfo = classes.find((cls) => cls.id === task.class_id);
    
    if (classInfo) {
      return `${taskTitle} | ${classInfo.class_code} - ${classInfo.class_group}`;
    }
    
    return taskTitle;
  };

  return (
    <div className="bg-[#EFEFEF] min-h-screen w-full p-5 md:p-10 max-sm:px-2">
      <div className="relative w-full h-full text-customBlack1 bg-white rounded-lg px-5 sm:px-10 pt-5 sm:pt-10 pb-4">
        <div className="absolute top-2 right-2 cursor-pointer">
          <IoIosClose size={35} onClick={() => navigate(`/auth`)} />
        </div>
        <div className="flex justify-between items-center max-md:flex-col max-md:justify-start max-md:items-start max-md:gap-2">
          <h2 className="text-customGray2 text-xl sm:text-3xl font-medium">Notifications</h2> 
          <button
          onClick={handleDeleteAll}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm max-sm:px-2 max-sm:text-xs"
        >
          Clear All Notifications
        </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-5 font-bold border-b-2 border-customGray1 pb-3 max-sm:hidden">
          <div>Task | Class Group</div>
          <div className="col-span-3">Notification</div>
          <div>Date</div>
        </div>

        <div className="min-h-full overflow-y-auto mt-4 text-customGray2">
          {currentNotifications.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <FaRegBellSlash size={50} className="text-gray-400" />
              <p className="text-gray-400 ml-3">No notifications available</p>
            </div>
          ) : (
            currentNotifications.map((notification, index) => (
              <Link to={`/task/${notification.task_id}`} key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-4 py-3 border-b">
                <div>{getTaskDisplay(notification.task_id)}</div>
                <div className="col-span-3">{notification.message}</div>
                <div>{formatDueDateTime(notification.created_at)}</div>
              </Link>
            ))
          )}
        </div>

        {currentNotifications.length > 0 && (
          <div className="flex gap-5 justify-center items-center mt-3">
            <FaArrowLeft
              className={`cursor-pointer ${currentPage === 1 ? 'text-gray-400' : ''}`}
              onClick={handlePrevPage}
            />
            <p>
              Page {currentPage} of {totalPages}
            </p>
            <FaArrowRight
              className={`cursor-pointer ${currentPage === totalPages ? 'text-gray-400' : ''}`}
              onClick={handleNextPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
