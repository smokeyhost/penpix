const TaskActions = ({ onEdit, onDelete, onAnalyze, onGetLink, openUploadModal, openGetTemplate }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col text-customBlack1">
      <button
        className="flex-1 hover:text-white p-2 hover:bg-gray-600 border-b border-gray-500 border-opacity-50"
        onClick={onAnalyze}
      >
        Open Task
      </button>
      <button
        className="flex-1 hover:text-white p-2 hover:bg-gray-600 border-b border-gray-500 border-opacity-50"
        onClick={onEdit}
      >
        Edit Task
      </button>
      <button
        className="flex-1 hover:text-white p-2 hover:bg-gray-600 border-b border-gray-500 border-opacity-50"
        onClick={onGetLink}
      >
        Generate Link
      </button>
      <button
        className="flex-1 hover:text-white p-2 hover:bg-gray-600 border-b border-gray-500 border-opacity-50"
        onClick={openUploadModal}
      >
        Upload File
      </button>
      <button
        className="flex-1 hover:text-white p-2 hover:bg-gray-600 border-b border-gray-500 border-opacity-50"
        onClick={openGetTemplate}
      >
        Get Template
      </button>
      <button
        className="flex-1 hover:text-white p-2 hover:bg-gray-600 border-b border-gray-500 border-opacity-50"
        onClick={onDelete}
      >
        Delete Task
      </button>
    </div>
  );
};

export default TaskActions;
