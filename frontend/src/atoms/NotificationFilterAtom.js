import { atom } from 'recoil';

const getInitialFilters = () => {
  const savedFilters = localStorage.getItem('notificationFilters');
  return savedFilters ? JSON.parse(savedFilters) : ['new_submission'];
};

export const NotificationFilterAtom = atom({
  key: 'NotificationFilterAtom',
  default: getInitialFilters(),
});