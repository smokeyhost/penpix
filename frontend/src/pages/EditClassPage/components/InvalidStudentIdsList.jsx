// InvalidStudentIdsList.jsx
const InvalidStudentIdsList = ({ invalidIds, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-lg w-full">
        <strong className="font-bold">The following Student IDs are invalid:</strong>
        <ul className="list-disc pl-5 mt-2">
          {invalidIds.map((id, index) => (
            <li key={index}>{id}</li>
          ))}
        </ul>
        <span
          className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
          onClick={onClose}
        >
          <svg
            className="fill-current h-6 w-6 text-red-500"
            role="button"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <title>Close</title>
            <path d="M14.348 5.652a1 1 0 10-1.414-1.414L10 7.172 7.066 4.238a1 1 0 10-1.414 1.414L8.828 10l-3.176 3.176a1 1 0 101.414 1.414L10 12.828l2.934 2.934a1 1 0 001.414-1.414L11.172 10l3.176-3.176z" />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default InvalidStudentIdsList;
