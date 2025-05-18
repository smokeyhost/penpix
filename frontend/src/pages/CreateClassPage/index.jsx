import StudentList from "./components/StudentList";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from 'recoil';
import { UserAtom } from '../../atoms/UserAtom';
import { useEffect, useRef, useState } from "react";
import useToast from "../../hooks/useToast";
import axios from "axios";
import { FaInfoCircle } from "react-icons/fa";
import InvalidStudentIdsList from "./components/InvalidStudentIdsList";
import CreatableSelect from "react-select/creatable";

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
  const [existingClasses, setExistingClasses] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const groupInputRef = useRef(null);

  const user = useRecoilValue(UserAtom);
  const { toastSuccess, toastWarning } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get("/classes/get-classes");
        setExistingClasses(res.data || []);
      } catch (e) {
        console.error("Error fetching classes:", e);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!classData.classCode) {
      setGroupOptions([]);
      setClassData((prev) => ({ ...prev, classGroup: "" }));
      setSelectedCourse(null);
      return;
    }
    const courseGroups = existingClasses
      .filter(cls => cls.class_code === classData.classCode)
      .map(cls => Number(cls.class_group));
    if (courseGroups.length > 0) {
      setSelectedCourse(classData.classCode);
      // Find the lowest available group number
      let group = 1;
      while (courseGroups.includes(group)) group++;
      setClassData((prev) => ({ ...prev, classGroup: group.toString() }));
      setGroupOptions(courseGroups);
    } else {
      setSelectedCourse(null);
      setGroupOptions([]);
    }
  }, [classData.classCode, existingClasses]);

  function getNextAvailableGroup(current, taken, dir) {
    let next = current;
    for (let i = 0; i < 99; i++) {
      next += dir;
      if (next < 1) next = 1;
      if (!taken.includes(next)) return next;
    }
    return current;
  }
  const handleGroupKeyDown = (e) => {
    if (!selectedCourse) return;
    const taken = groupOptions;
    let current = Number(classData.classGroup) || 1;

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      let dir = e.key === "ArrowUp" ? 1 : -1;
      let next = getNextAvailableGroup(current, taken, dir);
      if (next !== current) {
        setClassData((prev) => ({ ...prev, classGroup: next.toString() }));
      }
    } else if (
      !["Tab", "Backspace", "Delete"].includes(e.key) &&
      (e.key < "0" || e.key > "9")
    ) {
      e.preventDefault();
    }
  };

  const handleGroupChange = (e) => {
    let value = e.target.value.replace(/^0+/, "");
    if (!/^\d+$/.test(value) && value !== "") return;

    if (selectedCourse && groupOptions.includes(Number(value))) {
      // Find next available group in the direction of change
      let prev = Number(classData.classGroup) || 1;
      let dir = Number(value) > prev ? 1 : -1;
      let next = getNextAvailableGroup(prev, groupOptions, dir);
      setClassData({ ...classData, classGroup: next.toString() });
    } else {
      setClassData({ ...classData, classGroup: value });
    }
  };

  const courseOptions = Array.from(
    new Set(existingClasses.map(cls => cls.class_code))
  ).map(code => ({ value: code, label: code }));

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
            <div className="flex-1">
              <CreatableSelect
                options={courseOptions}
                value={courseOptions.find(opt => opt.value === classData.classCode) || (classData.classCode ? { value: classData.classCode, label: classData.classCode } : null)}
                onChange={selectedOption => {
                  setClassData(prev => ({
                    ...prev,
                    classCode: selectedOption ? selectedOption.value : "",
                  }));
                }}
                placeholder="Course Code"
                isClearable
                isSearchable
                noOptionsMessage={() => "Type to create new course code"}
                formatCreateLabel={input => `Create "${input}"`}
              />
            </div>
            <input
              type="number"
              min="1"
              placeholder="Group"
              ref={groupInputRef}
              className={`w-full md:w-[100px] border ${errors.classGroup ? 'border-red-500' : 'border-gray-300'} rounded-lg px-2 py-1 focus:outline-none text-md`}
              value={classData.classGroup || ""}
              onChange={handleGroupChange}
              onKeyDown={handleGroupKeyDown}
              onPaste={e => e.preventDefault()}
              disabled={selectedCourse && groupOptions.length > 0 && groupOptions.length >= 99}
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
            {!loading ? selectedCourse ? 'Add Group': 'Create Class': "Creating..."}
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
