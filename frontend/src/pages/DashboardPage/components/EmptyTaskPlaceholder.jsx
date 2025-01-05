// EmptyTasksPlaceholder.jsx
import { FaPlusCircle } from 'react-icons/fa'; // Example icon from react-icons

const EmptyTasksPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-md shadow-sm h-[500px]">
      <FaPlusCircle className="text-gray-500 text-6xl mb-4" />
      <p className="text-gray-500 text-center">No tasks available. Create a new task to get started.</p>
    </div>
  );
};

export default EmptyTasksPlaceholder;
