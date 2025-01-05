import { Switch } from '@headlessui/react';

const NotificationSwitch = ({ text, isChecked, onChange }) => {
  return (
    <div className="flex items-center justify-between">
      <label className="text-lg text-customGray2">{text}</label>
      <div className="flex items-center gap-4">
        <Switch
          checked={isChecked}
          onChange={onChange}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ease-in-out duration-200 ${
            isChecked ? 'bg-[#65558F]' : 'bg-gray-400'
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ease-in-out duration-200 ${
              isChecked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </Switch>
      </div>
    </div>
  );
};

export default NotificationSwitch;