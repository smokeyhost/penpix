// useNotifications.js
import axios from 'axios';
import { useRecoilState, useRecoilValue } from 'recoil';
import { NotificationsAtom } from '../atoms/Notifications';
import { NotificationFilterAtom } from '../atoms/NotificationFilterAtom';


const useNotifications = () => {
  const filters = useRecoilValue(NotificationFilterAtom);
  const [notifications, setNotifications] = useRecoilState(NotificationsAtom);

  const fetchUnreadNotifications = async () => {
    try {
      const response = await axios.get('/notification/get-unread-notifications', 
        {
          params: 
            { filters: filters.join(',') } 
        }
      );
      setNotifications(response.data?.notifications || []);
      // console.log("Notifications", response.data?.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/notification/mark-as-read/${notificationId}`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return {
    notifications,
    fetchUnreadNotifications,
    markAsRead,
    setNotifications
  };
};

export default useNotifications;
