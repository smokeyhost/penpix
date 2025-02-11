import { FaRegBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Notifications = ({ onClose, notificationsList, fetchUnreadNotifications }) => {
  const navigate = useNavigate();

  const handleNotificationClick = async (notification) => {
    try {
      await axios.patch(`/notification/mark-as-read/${notification.id}`);
      navigate(`/task/${notification.task_id}`);
      fetchUnreadNotifications();
      onClose();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.patch(`/notification/mark-all-as-read`);
      fetchUnreadNotifications();
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  return (
    <div className="w-[280px] text-white bg-black text-sm pb-3 pt-2 max-md:w-[250px] rounded-lg ">
      <div className="text-white flex items-center gap-2 ml-4">
        <FaRegBell color="white" />
        <span className="font-semibold">Notifications</span>
      </div>
      <div className="w-full max-h-[250px] flex flex-col font-light text-xs mt-4 overflow-y-auto">
        {notificationsList.length > 0 ? (
          notificationsList.map((notification) => (
            <div
              key={notification.id}
              className={`border-b-1 border-customGray1 py-3 px-5 cursor-pointer ${
                notification.is_read ? "opacity-50" : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              {notification.message}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400">No notifications</div>
        )}
      </div>

      {notificationsList.length > 0 && (
        <div className="text-right mr-5 mt-3">
          <button
            className="text-xs underline italic"
            onClick={handleClearAll}
          >
            Clear All
          </button>
        </div>
      )}

      <p
        className="underline italic mt-5 mr-5 text-xs text-right font-normal cursor-pointer"
        onClick={() => {
          onClose();
          navigate("/notifications");
        }}
      >
        View all notifications
      </p>
    </div>
  );
};

export default Notifications;
