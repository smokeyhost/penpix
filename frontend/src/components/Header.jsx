import { useEffect, useRef, useState, useMemo } from "react";
import Links from "./Links";
import { Link, useNavigate } from "react-router-dom";
import { LuMenu } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { RiNotification2Line } from "react-icons/ri";
import { IoLogOut } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import useToast from "../hooks/useToast";
import useLogout from "../hooks/useLogoutUser";
import Notifications from "./Notifications";
import useNotifications from "../hooks/useNotifications";
import { useRecoilValue } from "recoil";
import { UserAtom } from "../atoms/UserAtom";

const Header = () => {
  const { notifications, fetchUnreadNotifications } = useNotifications();
  const currentUser = useRecoilValue(UserAtom);
  const [showMenu, setShowMenu] = useState(false);
  const { toastSuccess, toastError } = useToast();
  const { logout } = useLogout();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchUnreadNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredNotifications = useMemo(() => {
    const activeFilters =
      JSON.parse(localStorage.getItem("notificationFilters")) || [];
    const filterTimestamps = {};
    activeFilters.forEach((filter) => {
      const ts = localStorage.getItem(`notificationFilterTimestamp_${filter}`);
      if (ts) {
        filterTimestamps[filter] = new Date(ts);
      }
    });
    const sorted = [...notifications].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    return sorted.filter((notification) => {
      if (activeFilters.includes(notification.type)) {
        const activationTime = filterTimestamps[notification.type];
        if (activationTime) {
          return new Date(notification.created_at) >= activationTime;
        }
      }
      return true;
    });
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return filteredNotifications.filter((notification) => !notification.read).length;
  }, [filteredNotifications]);

  const handleLogout = async () => {
    try {
      logout();
      toastSuccess("Logout Successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toastError("Logout failed");
    }
  };

  return (
    <header className="flex justify-between items-center h-[60px] border-b-2 px-5 py-4 w-full bg-white shadow-md relative">
      <div className="flex items-center">
        <Link to={`/dashboard/${currentUser?.id}`}>
          <img src="/icons/PenPix-txt.png" alt="Logo" className="h-8" />
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-6">
        <Links onClickLink={() => setShowMenu(false)} />
      </nav>

      <div className="flex items-center gap-6 max-md:gap-3">
        <div className="relative cursor-pointer">
          <RiNotification2Line
            size={25}
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <IoSettingsOutline
          size={25}
          onClick={() => navigate("/settings")}
          className="cursor-pointer"
        />
        <button
          className="flex items-center gap-2 text-primaryColor font-semibold max-md:hidden"
          onClick={handleLogout}
        >
          Logout
          <IoLogOut size={25} color="#F26132" />
        </button>
        <LuMenu
          size={30}
          className="md:hidden cursor-pointer"
          onClick={() => setShowMenu(true)}
        />
      </div>

      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end md:hidden">
          <div className="w-3/4 max-w-[280px] bg-white h-full shadow-lg transform transition-transform">
            <div className="flex justify-between items-center mb-6 p-5">
              <h2 className="text-lg font-semibold">Menu</h2>
              <IoClose
                size={30}
                className="cursor-pointer"
                onClick={() => setShowMenu(false)}
              />
            </div>
            <Links onClickLink={() => setShowMenu(false)} />
            <div className="mt-8 space-y-4 ">
              <button
                className="w-full flex items-center justify-center gap-2 text-lg font-medium text-primaryColor hover:underline"
                onClick={logout}
              >
                Logout
                <IoLogOut size={25} color="#F26132" />
              </button>
            </div>
          </div>
        </div>
      )}

      {isNotificationOpen && (
        <div
          className="absolute top-14 right-[170px] bg-white shadow-lg rounded-lg z-50 max-md:right-[100px]"
          ref={notificationRef}
        >
          <Notifications
            notificationsList={filteredNotifications}
            fetchUnreadNotifications={fetchUnreadNotifications}
            onClose={() => setIsNotificationOpen(false)}
          />
        </div>
      )}
    </header>
  );
};

export default Header;
