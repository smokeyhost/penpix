import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTaskForm from './CreateTaskForm';
import { FaPlus } from "react-icons/fa";

const FilterCreateNav = ({  onFilterChange,
                            selectedCourse,
                            setSelectedCourse,
                            selectedGroup,
                            setSelectedGroup,
                            selectedTaskType,
                            setSelectedTaskType,
                            searchTerm,
                            setSearchTerm,
                            classList,
                          }) => {

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const navigate = useNavigate();
  const handleAnyFilterChange = (changed = {}) => {
    console.log(changed)

  onFilterChange({
    status: changed.status !== undefined ? changed.status : selectedFilter,
    course: changed.course !== undefined ? changed.course : selectedCourse,
    group: changed.group !== undefined ? changed.group : selectedGroup,
    type: changed.type !== undefined ? changed.type : selectedTaskType,
    search: changed.search !== undefined ? changed.search : searchTerm,
  });
};

  const getUniqueClassCodes = (classList) => {
    const seen = new Set();
    return classList.filter(cls => {
      if (seen.has(cls.class_code)) return false;
      seen.add(cls.class_code);
      return true;
    });
  };
  const uniqueClassCodes = getUniqueClassCodes(classList || []);

  const handleStatusChange = (e) => {
    setSelectedFilter(e.target.value);
    handleAnyFilterChange({ status: e.target.value });
  };
  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
    handleAnyFilterChange({ course: e.target.value });
  };
  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
    handleAnyFilterChange({ group: e.target.value });
  };
  const handleTypeChange = (e) => {
    setSelectedTaskType(e.target.value);
    handleAnyFilterChange({ type: e.target.value });
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    handleAnyFilterChange({ search: e.target.value });
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
      <div className="flex flex-col gap-4">
        {/* Filter title */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Filter</h2>
          <div>
          <button
            className="bg-primaryColor text-white rounded px-4 py-2 text-sm font-semibold flex items-center gap-2"
            onClick={handleCreateTask}
          >
            <FaPlus /> Create New Task
          </button>
        </div>
        </div>

        {/* Filter bar */}
        <div className="flex justify-between flex-wrap items-center gap-4">


          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1 text-sm">
              <label className="font-medium">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => handleCourseChange(e)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">All</option>
                {uniqueClassCodes.map((cls) => (
                  <option key={cls.class_code} value={cls.class_code}>{cls.class_code}</option>
                ))}
              </select>
            </div>

            {/* Group */}
            <div className="flex items-center gap-1 text-sm">
              <label className="font-medium">Group</label>
              <input
                type="number"
                min="1"
                value={selectedGroup}
                onChange={e => handleGroupChange(e)}
                className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                placeholder="All"
              />
            </div>

            {/* Task Type */}
            <div className="flex items-center gap-1 text-sm">
              <label className="font-medium">Type</label>
              <select
                value={selectedTaskType}
                onChange={(e) => handleTypeChange(e)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">All</option>
          
                <option value="Quiz">Quiz</option>
                <option value="Exercise">Exercise</option>
                <option value="Prelims">Prelims</option>
                <option value="Midterm">Midterm</option>
                <option value="PreFinals">Pre-Finals</option>
                <option value="Finals">Finals</option>
                <option value="Assignment">Assignment</option>
                <option value="Lab">Lab Exercise</option>
                <option value="Activity">Activity</option>
                <option value="MockExam">Mock Exam</option>
                <option value="Review">Review</option>
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center gap-1 text-sm">
              <label className="font-medium">Status</label>
              <select
                value={selectedFilter}
                onChange={(e)=> handleStatusChange(e)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="All">All</option>
                <option value="Completed">Completed</option>
                <option value="Ongoing">Ongoing</option>
              </select>
            </div>

            {/* Search bar */}
          </div>
           <div className="flex items-center gap-1 text-sm w-full sm:w-auto">
            <label className="font-medium">Search</label>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {showCreateTaskForm && <CreateTaskForm onClose={handleCloseForm} />}
    </div>
  );
};

export default FilterCreateNav;
