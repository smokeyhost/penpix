import { FaArrowLeft, FaArrowRight, FaUserCircle } from "react-icons/fa";
import Combobox from "./Combobox";
import { Link } from "react-router-dom";
import { UserAtom } from "../../../atoms/UserAtom";
import { useRecoilValue } from "recoil";
import { formatDueDateTime } from "../../../utils/helpers";
import { useState } from "react";

const Header = ({ task, files, onCurrentFileChange, gradedFilesCount, fileIndex }) => {
  const currentUser = useRecoilValue(UserAtom);
  const formattedOptions = files?.map((file) => ({
    id: file.id,
    value: file.file_url,
    label: file.filename,
    graded: file.graded,
    mimetype: file.mimetype,
  }));
  // console.log("index",fileIndex)
  const [currentIndex, setCurrentIndex] = useState(fileIndex);
  const currentFile = formattedOptions[currentIndex];

  const handleSelectedSubmission = (selectedSubmission) => {
    const newIndex = formattedOptions.findIndex(option => option.id === selectedSubmission.id);
    setCurrentIndex(newIndex); 
    const currentFile = files[newIndex];
    onCurrentFileChange(currentFile)
  };  

  const handleArrowLeft = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      const currentFile = files[currentIndex-1];
      onCurrentFileChange(currentFile)
    }
  };

  const handleArrowRight = () => {
    if (currentIndex < formattedOptions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      const currentFile = files[currentIndex+1];
      onCurrentFileChange(currentFile)
    }
  };

  return (
    <div className="flex justify-between items-center gap-8 max-sm:gap-3 bg-white w-full h-[50px] border-b border-borderGray px-5 py-8  max-sm:p-2 font-sans text-customBlack1">
      <div className="cursor-pointer max-sm:hidden">
        <Link to={`/dashboard/${currentUser.id}`} className="flex gap-2 items-center">
          <span className="font-bold text-2xl">PenPix</span>
          <span className="text-sm font-semibold max-lg:hidden text-customGray2">| Dashboard</span>
        </Link>
      </div>

      <Link to={`/task/${task.id}`} className="flex-1 flex justify-between items-center border-r-2 border-l-2 max-sm:border-l-0 border-borderGray px-7">
        <div className="max-lg:hidden ">
          <h3 className="font-semibold text-sm">Task: {task.title}</h3>
          <small>Due date: {formatDueDateTime(task.due_date)}</small>
        </div>
        <div className="flex items-center justify-between gap-10 w-[150px] max-lg:w-full">
          <div className="flex flex-col items-center text-sm max-sm:text-xs">
            <p>{gradedFilesCount}/{files.length}</p> 
            <label >Graded</label>
          </div>
          <div className="text-sm max-sm:text-xs">
            <p>{files.length ? currentIndex + 1: 0}/{files.length}</p> 
          </div>
        </div>
      </Link>

      <div className="pagination flex justify-between gap-5 max-sm:gap-2 items-center w-[350px] max-md:w-full">
        <FaArrowLeft 
          size={20} 
          className={`cursor-pointer ${currentIndex === 0 ? 'opacity-50' : ''}`}
          onClick={handleArrowLeft}
        />
        <div className="flex items-center gap-2 w-full">
          <FaUserCircle size={35} />
          <Combobox
            options={formattedOptions}
            value={currentFile}  
            onOptionSelect={handleSelectedSubmission}  
          />
        </div>
        <FaArrowRight 
          size={20} 
          className={`cursor-pointer ${currentIndex === formattedOptions.length - 1 ? 'opacity-50' : ''}`}
          onClick={handleArrowRight}
        />
      </div>
    </div>
  );
};

export default Header;
