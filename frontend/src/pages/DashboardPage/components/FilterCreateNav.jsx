import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTaskForm from './CreateTaskForm';
import { FaPlus } from "react-icons/fa";

const FilterCreateNav = ({ onFilterChange }) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const navigate = useNavigate();

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    onFilterChange(filter);
  };

  const handleCreateTask = () => {
    navigate('/create-task');
    setShowCreateTaskForm(true); 
  };

  const handleCloseForm = () => {
    setShowCreateTaskForm(false); 
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 w-full justify-between">
        <div className="flex flex-wrap gap-2 sm:gap-10 justify-between w-full sm:w-auto h-full">
          <div className="flex items-center justify-between bg-gray-200 rounded-md text-sm font-light border-2 border-customGray2 overflow-hidden w-full sm:w-auto">
            <button
              className={`px-4 py-1 w-full sm:w-auto rounded-l-md ${selectedFilter === 'All' ? 'bg-white text-gray-900' : 'hover:bg-white text-gray-900'}`}
              onClick={() => handleFilterChange('All')}
            >
              All
            </button>
            <button
              className={`px-3 py-1 w-full sm:w-auto border-r-2 border-l-2 border-customGray2 ${selectedFilter === 'Completed' ? 'bg-white text-gray-900' : 'hover:bg-white text-gray-900'}`}
              onClick={() => handleFilterChange('Completed')}
            >
              Completed
            </button>
            <button
              className={`px-3 py-1 w-full sm:w-auto rounded-r-md ${selectedFilter === 'Ongoing' ? 'bg-white text-gray-900' : 'hover:bg-white text-gray-900'}`}
              onClick={() => handleFilterChange('Ongoing')}
            >
              Ongoing
            </button>
          </div>
        </div>

        <button 
          className="bg-primaryColor text-white rounded-md px-5 py-2 font-semibold flex items-center gap-2 w-full sm:w-auto" 
          onClick={handleCreateTask}
        >
          <FaPlus /> Create New Task
        </button>
      </div>

      {showCreateTaskForm && (<CreateTaskForm onClose={handleCloseForm} />)}
    </div>
  );
};

export default FilterCreateNav;
