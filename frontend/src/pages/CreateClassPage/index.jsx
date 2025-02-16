import StudentList from "./components/StudentList";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from 'recoil';
import { UserAtom } from '../../atoms/UserAtom';
import { useState } from "react";
import useToast from "../../hooks/useToast";
import axios from "axios";
import { FaInfoCircle } from "react-icons/fa";
import InvalidStudentIdsList from "./components/InvalidStudentIdsList";

const CreateClassPage = () => {
  const [classData, setClassData] = useState({
    classCode: '',
    classGroup: '',
    classSchedule: '',
    studentList: []
  });

  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [invalidStudentIds, setInvalidStudentIds] = useState([]);
  
  const user = useRecoilValue(UserAtom);
  const { toastSuccess, toastWarning} = useToast();
  const navigate = useNavigate();

  const handleCreateClass = async () => {
    const newErrors = {};

    if (!classData.classCode.trim()) {
      newErrors.classCode = "Course Code is required.";
    }

    if (!classData.classGroup.trim()) {
      newErrors.classGroup = "Class Group is required.";
    }

    if (!classData.classSchedule.trim()) {
      newErrors.classSchedule = "Class Schedule is required.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const classPayload = {
      classCode: classData.classCode,
      classGroup: classData.classGroup,
      classSchedule: classData.classSchedule,
      studentList: classData.studentList
    };

    setLoading(true);
    try {
      await axios.post('/classes/create-class', classPayload);
      toastSuccess("Class created successfully.");
      navigate(`/classes/${user?.id}`);
    } catch (error) {
      console.error("Error creating class:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = () => {
    if (!studentId.trim()) {
      setInvalidStudentIds(["Please enter a valid Student ID."]);
      return;
    }
  
    const allStudentIds = studentId.split(",").map(id => id.trim());
    const validStudentIds = allStudentIds.filter(id => /^\d{8}$/.test(id));
    const invalidStudentIdsList = allStudentIds.filter(id => !/^\d{8}$/.test(id));
  
    if (validStudentIds.length === 0) {
      setInvalidStudentIds(["Please enter valid 8-digit Student IDs."]);
      return;
    }
  
    const existingStudents = new Set(classData.studentList);
    const uniqueNewStudents = validStudentIds.filter(id => !existingStudents.has(id));
  
    if (uniqueNewStudents.length === 0) {
      toastWarning("All entered Student IDs already exist in the class.");
      return;
    }
  
    setClassData(prev => ({
      ...prev,
      studentList: [...prev.studentList, ...uniqueNewStudents].sort((a, b) => a.localeCompare(b)),
    }));
  
    setStudentId('');
  
    if (invalidStudentIdsList.length > 0) {
      setInvalidStudentIds(invalidStudentIdsList);
    }
  };

  const handleRemoveStudent = (index) => {
    setClassData((prev) => ({
      ...prev,
      studentList: prev.studentList.filter((_, i) => i !== index)
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddStudent();
    }
  };

  return (
    <div className="h-screen overflow-y-auto pb-24">
      <div className="flex flex-col p-5 gap-4 w-full max-w-[800px] mx-auto">
        <h1 className="text-[28px] font-medium mt-2">Create Class</h1>
        <div className="flex flex-col gap-2">
          <label className="text-md font-medium">Class Details</label>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Course Code"
              maxLength={30}
              className={`flex-1 placeholder-gray-500 placeholder-opacity-75 focus:placeholder-opacity-50 border ${errors.classCode ? 'border-red-500' : 'border-gray-300'} rounded-lg px-2 py-1 focus:outline-none text-md`}
              value={classData.classCode}
              onChange={(e) => setClassData({ ...classData, classCode: e.target.value })}
            />
            <input
              type="number"
              min="1"
              placeholder="Group"
              className={`w-full md:w-[100px] border ${errors.classGroup ? 'border-red-500' : 'border-gray-300'} rounded-lg px-2 py-1 focus:outline-none text-md`}
              value={classData.classGroup || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d+$/.test(value) || value === "") {  
                  setClassData({ ...classData, classGroup: value });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e" || e.key === ".") {
                  e.preventDefault(); 
                }
              }}
              onPaste={(e) => {
                const paste = e.clipboardData.getData("text");
                if (!/^\d+$/.test(paste)) {
                  e.preventDefault(); 
                }
              }}
            />
          </div>
          {errors.classCode && <p className="text-red-500 text-sm">{errors.classCode}</p>}
          {errors.classGroup && <p className="text-red-500 text-sm">{errors.classGroup}</p>}
          <input
            type="text"
            placeholder="Class Schedule"
            maxLength={50}
            className={`placeholder-gray-500 placeholder-opacity-75 focus:placeholder-opacity-50 border ${errors.classSchedule ? 'border-red-500' : 'border-gray-300'} rounded-lg px-2 py-1 focus:outline-none text-md`}
            value={classData.classSchedule}
            onChange={(e) => setClassData({ ...classData, classSchedule: e.target.value })}
          />
          {errors.classSchedule && <p className="text-red-500 text-sm">{errors.classSchedule}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-md font-medium">Student ID Number</label>
          <div className="flex gap-5 items-center">
            <input
              type="text"
              placeholder="Id Number(s)"
              className="placeholder-gray-500 placeholder-opacity-75 focus:placeholder-opacity-50 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none text-md"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="relative group">
              <FaInfoCircle className="text-gray-500 cursor-pointer" />
              <div className="absolute bottom-full mb-2 w-72 p-2 bg-white border border-gray-300 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 sm:left-0 sm:right-auto sm:translate-x-0">
                <p className="text-sm text-gray-700">You may add multiple student IDs at once, separated by commas.</p>
                <p className="text-sm text-gray-700">Format: id_number1, id_number2</p>
                <p className="text-sm text-gray-700">Example: 20103214, 20203241, 12345678</p>
                <p className="text-sm text-gray-700">Note: Only accepts numeric student IDs that are exactly 8 digits.</p>
              </div>
            </div>
          </div>
        </div>
        <button
          className="px-6 py-2 bg-black text-white rounded-lg"
          onClick={handleAddStudent}
        >
          Add Student
        </button>
        <div>
          <StudentList studentList={classData.studentList} onRemoveStudent={handleRemoveStudent} />
        </div>
        <div className="flex flex-col-reverse md:flex-row gap-4 mt-5">
          <button
            className="px-4 py-2 bg-gray-300 rounded-lg w-full md:w-auto"
            onClick={() => navigate(`/classes/${user?.id}`)}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 bg-black text-white rounded-lg w-full md:w-auto"
            onClick={handleCreateClass}
          >
            {!loading ? "Create Class" : "Creating..."}
          </button>
        </div>

        {invalidStudentIds.length > 0 && (
          <InvalidStudentIdsList 
            invalidIds={invalidStudentIds} 
            onClose={() => setInvalidStudentIds([])} 
          />
        )}
      </div>
    </div>
  );
};

export default CreateClassPage;
