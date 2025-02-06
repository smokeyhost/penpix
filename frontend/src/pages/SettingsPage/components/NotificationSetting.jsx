import { useRecoilState } from 'recoil';
import { NotificationFilterAtom } from '../../../atoms/NotificationFilterAtom';
import NotificationSwitch from "./NotificationSwitch";

const NotificationSetting = () => {
  const [notificationFilters, setNotificationFilters] = useRecoilState(NotificationFilterAtom);

  const handleToggle = (filter) => {
    setNotificationFilters((prevFilters) => {
      const newFilters = prevFilters.includes(filter)
        ? prevFilters.filter((item) => item !== filter)
        : [...prevFilters, filter];
      localStorage.setItem('notificationFilters', JSON.stringify(newFilters));
      return newFilters;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Notifications</h2>
      <div className="ml-4 flex flex-col gap-2">
        <NotificationSwitch
          text="New Submission"
          isChecked={notificationFilters.includes('new_submission')}
          onChange={() => handleToggle('new_submission')}
        />
        <NotificationSwitch
          text="Completed Submissions"
          isChecked={notificationFilters.includes('completed_submission')}
          onChange={() => handleToggle('completed_submission')}
        />
        <NotificationSwitch
          text="Due Date"
          isChecked={notificationFilters.includes('due_date')}
          onChange={() => handleToggle('due_date')}
        />
      </div>
    </div>
  );
};

export default NotificationSetting;