import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ClassCard = ({ classData, onDelete, recentTasks }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/edit-class/${classData.id}`);
  };

  const handleDeleteTask = async (e) => {
    e.stopPropagation();
    try {
      const response = await axios.delete(`/classes/delete-class/${classData.id}`);
      if (response.status === 200) {
        alert(`Class ${classData.class_code} deleted successfully.`);
        onDelete(classData.id); 
        console.log("Class deleted successfully.")
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      alert("Failed to delete the class. Please try again.");
    }
  };

  return (
    <div
      className="group relative shadow-xl rounded-lg w-full sm:w-[250px] lg:w-[300px] h-auto sm:h-[270px] lg:h-[300px] p-4 sm:p-5 cursor-pointer transform hover:scale-105 duration-200 bg-white"
      onClick={handleCardClick}
    >
      <div
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 duration-200"
        onClick={handleDeleteTask}
      >
        <FaTrash className="text-gray-500 cursor-pointer" />
      </div>

      <div>
        <span className="text-xs sm:text-sm font-light text-gray-500">{classData.class_schedule}</span>
        <div className="mt-2">
          <h3 className="font-semibold text-xl sm:text-2xl lg:text-3xl inline-block">{`Group ${classData.class_group}`}</h3>
          <span className="ml-2 text-xs sm:text-sm font-medium">{classData.class_code}</span>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-xs sm:text-sm font-semibold">Recent Tasks</h4>
        <ul className="text-gray-500 list-disc list-inside pl-5 h-[120px] mt-2 flex flex-col gap-2">
          {recentTasks.length === 0 ? (
            <li>No tasks available</li> 
          ) : (
            recentTasks.map((taskTitle, index) => (
              <li key={index}>{taskTitle}</li> 
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default ClassCard;
