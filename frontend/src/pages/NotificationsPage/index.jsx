import { IoIosClose } from "react-icons/io";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { FaRegBellSlash } from "react-icons/fa"; // Add the empty notification icon
import { useEffect, useState } from "react";
import axios from "axios";
import useErrorHandler from '../../hooks/useErrorHandler';
import { formatDueDateTime, truncateText } from "../../utils/helpers";
import { Link, useNavigate } from "react-router-dom";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const { handleError } = useErrorHandler();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [notificationsPerPage] = useState(8); // Number of notifications per page
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/notification/get-all-notifications'); // Adjust the URL if necessary
        const fetchedNotifications = response.data.notifications;

        const sortedNotifications = fetchedNotifications.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at); // Latest first
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
        const response = await axios.get('/task/get-tasks', { withCredentials: true });
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

  // Calculate total pages
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  // Get notifications for the current page
  const currentNotifications = notifications.slice(
    (currentPage - 1) * notificationsPerPage,
    currentPage * notificationsPerPage
  );

  // Handle previous page
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getTaskTitle = (taskId) => {
    const task = tasks.find((task) => task.id === taskId);
    return task ? task.title : 'Unknown Task';
  };

  return (
    <div className="bg-[#EFEFEF] min-h-screen w-full p-10">
      <div className="relative w-full h-full text-customBlack1 bg-white rounded-lg px-10 pt-10 pb-4">
        <div className="absolute top-2 right-2 cursor-pointer">
          <IoIosClose size={35} onClick={() => navigate(`/auth`)} />
        </div>

        <h2 className="text-customGray2 text-3xl font-medium">Notifications</h2>

        <div className="grid grid-cols-5 gap-4 mt-5 font-bold border-b-2 border-customGray1 pb-3">
          <div>Task</div>
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
              <Link to="#" key={index} className="grid grid-cols-5 gap-4 py-3 border-b">
                <div>{truncateText(getTaskTitle(notification.task_id), 10)}</div>
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