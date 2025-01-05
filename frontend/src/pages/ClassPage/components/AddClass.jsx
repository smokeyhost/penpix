import { IoMdAddCircleOutline } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

const AddClass = () => {
  const navigate = useNavigate();

  return (
    <button 
      className="group relative shadow-xl rounded-lg w-full sm:w-[250px] lg:w-[300px] h-auto sm:h-[270px] lg:h-[300px] p-4 sm:p-5 cursor-pointer transform hover:scale-105 duration-200 bg-white flex justify-center items-center flex-col gap-2"
      onClick={() => navigate('/create-class')}
    >
      <IoMdAddCircleOutline size={100} className="sm:size-[120px] lg:size-[140px]" color="gray" />
      <p className="font-semibold text-customGray3 text-base sm:text-lg lg:text-xl">Add Class</p>
    </button>
  );
}

export default AddClass;
