import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../../../contexts/ConfirmContext"
import useToast from '../../../hooks/useToast'
import { truncateText } from '../../../utils/helpers'
import axios from "axios";

const ClassCard = ({ classData, onDelete, recentTasks }) => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const {toastSuccess} = useToast();

  const handleCardClick = () => {
    navigate(`/edit-class/${classData.id}`);
  };

  const handleDeleteTask = async (e) => {
    e.stopPropagation();
    const verificationText = `${classData.class_code}_${classData.class_schedule}_remove`;

    const message =`Deleting the class will remove all the tasks associated to it. Please type "${verificationText}" to confirm deletion.`
    const result = await confirm(message, true, verificationText);
    if (!result) return

    try {
      const response = await axios.delete(`/classes/delete-class/${classData.id}`);
      if (response.status === 200) {
        toastSuccess(`Class ${classData.class_code} deleted successfully.`)
        onDelete(classData.id); 
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
        <span className="text-xs sm:text-sm font-light text-gray-500">{truncateText(classData.class_schedule, 20)}</span>
        <div className="mt-2">
          <h3 className="font-semibold text-xl sm:text-2xl lg:text-3xl inline-block">{`Group ${classData.class_group}`}</h3>
          <span className="ml-2 text-xs sm:text-sm font-medium">{truncateText(classData.class_code, 15)}</span>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-xs sm:text-sm font-semibold">Recent Tasks</h4>
        <ul className="text-gray-500 list-disc list-inside pl-5 h-[120px] mt-2 flex flex-col gap-2">
          {recentTasks.length === 0 ? (
            <li>No tasks available</li> 
          ) : (
            recentTasks.map((taskTitle, index) => (
              <li key={index}>{truncateText(taskTitle, 13)}</li> 
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default ClassCard;
