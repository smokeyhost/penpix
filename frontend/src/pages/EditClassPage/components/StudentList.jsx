import { FaTrash } from 'react-icons/fa'; // Importing the trash icon

const StudentList = ({ studentList, onRemoveStudent }) => {
  return (
    <div>
      <label className="text-md font-medium">Student List</label>
      <div className="mt-2 border rounded-lg shadow-md w-full max-h-60 overflow-auto">
        {studentList.length === 0 ? (
          <p className="text-gray-500 text-center py-2">No students added yet.</p>
        ) : (
          studentList.map((student, index) => (
            <div key={index} className="flex items-center justify-between p-2 border-b">
              <p className="text-md font-medium">{student}</p>
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
