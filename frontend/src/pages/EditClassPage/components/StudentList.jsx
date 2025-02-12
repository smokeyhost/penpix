import { FaTrash } from 'react-icons/fa';

const StudentList = ({ studentList, onRemoveStudent }) => {
  return (
    <div>
      <label className="text-md font-medium">Student List</label>
      <div className="mt-2 border rounded-lg shadow-md w-full overflow-auto">
        {studentList.length === 0 ? (
          <div className="animate-pulse space-y-2 p-2">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="bg-gray-300 h-4 w-1/2 rounded"></div>
                <div className="bg-gray-300 h-4 w-4 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          studentList.map((student, index) => (
            <div key={index} className="flex items-center justify-between p-2 border-b">
              <p className="text-md">{index + 1}. {student}</p>
              <FaTrash
                className="text-red-500 cursor-pointer hover:text-red-700"
                onClick={() => onRemoveStudent(index)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentList;
