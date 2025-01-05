import CopyableLink  from "./CopyableLink";

const TaskLinkModal = ({ isOpen, onClose, taskId }) => {
  if (!isOpen) return null;

  const link = `${window.location.origin}/student-upload/${taskId}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-5 max-w-md w-full">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Get Task Link</h2>
        <CopyableLink link={link} />
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskLinkModal;
