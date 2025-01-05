// import { FaPencil } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { IoMdRemoveCircle } from "react-icons/io";
import { IoIosAddCircle } from "react-icons/io";
import Combobox from "./components/Combobox";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { UserAtom } from '../../atoms/UserAtom';
import axios from 'axios';

const taskTypeOptions = [
  { value: "quiz", label: "Quiz" },
  { value: "activity", label: "Activity" },
  { value: "exercise", label: "Exercise" },
  { value: "prelims", label: "Prelims" },
  { value: "midterm", label: "Midterm" },
  { value: "prefinals", label: "Pre-finals" },
  { value: "finals", label: "Finals" },
  { value: "project", label: "Project" },
  { value: "assignment", label: "Assignment" },
  { value: "review", label: "Review" },
  { value: "lab", label: "Laboratory Task" },
];

const getLabelFromValue = (value, options) => {
  const option = options.find(option => option.value === value);
  return option ? option.label : null;
};

const scoreOptions = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 15, label: "15" },
  { value: 20, label: "20" },
];

const CreateTaskPage = () => {
  const [next, setNext] = useState(false);
  const navigate = useNavigate();
  const user = useRecoilValue(UserAtom);
  const [classOptions, setClassOptions] = useState([]);
  const [errors, setErrors] = useState({});

  let initialDueDate = new Date()
  initialDueDate.setHours(31, 59, 59, 999);

  const [formData, setFormData] = useState({
    title: "",
    classId: "",
    examType: "",
    dueDate: initialDueDate.toISOString().slice(0, 16),
    answerKeys: [
      {
        item: `Item ${1}`,
        keys: [{ grade: "", expression: "" }],
      }
    ],
    totalSubmissions: 0,
    reviewedSubmissions: 0,
    status: "Ongoing",
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("/classes/get-classes");
        const formattedOptions = response.data.map((classItem) => ({
          value: classItem.id,
          label: `${classItem.class_code} | ${classItem.class_schedule}`,
        }));
        setClassOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  
    if (errors[name]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleComboBoxChange = (selected, fieldName) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: selected?.value || "",
    }));
  
    if (errors[fieldName]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[fieldName]; 
        return newErrors;
      });
    }
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      answerKeys: [
        ...prev.answerKeys,
        {
          item: `Item ${prev.answerKeys.length + 1}`,
          keys: [{ grade: "", expression: "" }],
        },
      ],
    }));
  };

  const handleAddExpression = (itemIndex) => {
    const updatedAnswerKeys = [...formData.answerKeys];
    updatedAnswerKeys[itemIndex].keys.push({ grade: "", expression: "" });
    setFormData((prev) => ({ ...prev, answerKeys: updatedAnswerKeys }));
  };

  const updateErrorState = (errors, itemIndex, keyIndex, field) => {
    const newErrors = { ...errors };
    if (field === "expression") {
      newErrors[`answerKeyExpression-${itemIndex}-${keyIndex}`] = null;
    }
    
    if (field === "grade") {
      newErrors[`answerKeyGrade-${itemIndex}-${keyIndex}`] = null;
    }
    
    setErrors(newErrors);
  };

  const handleExpressionChange = (itemIndex, keyIndex, field, value) => {
    const updatedAnswerKeys = [...formData.answerKeys];
    updatedAnswerKeys[itemIndex].keys[keyIndex][field] = value;

    updateErrorState(errors, itemIndex, keyIndex, field);
    setFormData((prev) => ({ ...prev, answerKeys: updatedAnswerKeys }));
  };
  
  const handleRemoveExpression = (itemIndex, keyIndex) => {
    const updatedAnswerKeys = [...formData.answerKeys];
    updatedAnswerKeys[itemIndex].keys = updatedAnswerKeys[itemIndex].keys.filter((_, i) => i !== keyIndex);
    setFormData((prev) => ({ ...prev, answerKeys: updatedAnswerKeys }));
  };

  const handleRemoveItem = (itemIndex) => {
    const updatedAnswerKeys = formData.answerKeys.filter((_, i) => i !== itemIndex);
    const renumberedAnswerKeys = updatedAnswerKeys.map((answer, index) => ({
      ...answer,
      item: `Item ${index + 1}`,
    }));
  
    setFormData((prev) => ({ ...prev, answerKeys: renumberedAnswerKeys }));
  };

  const handleCreateTask = async () => {
    console.log(formData)
    try {
      const response = await axios.post("/task/create-task", formData);
      console.log(response.data);
      navigate(`/dashboard/${user.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNext = () => {
    if (isFormValid()) {
      setNext(true);
    }
  };

  const isFormValid = () => {
    const newErrors = {};
  
    if (!formData.title.trim()) {
      newErrors.title = "Title is required.";
    }
  
    if (!formData.classId) {
      newErrors.classId = "Class Group is required.";
    }
  
    if (!formData.examType) {
      newErrors.examType = "examType of Task is required.";
    }
  
    formData.answerKeys.forEach((item, itemIndex) => {
      if (item.keys.length === 0) {
        newErrors[`missingAnswerKey${itemIndex}`] = `Each answer key should have at least one expression and grade.`;
      }
      item.keys.forEach((key, keyIndex) => {
        if (!key.expression.trim()) {
          newErrors[`answerKeyExpression-${itemIndex}-${keyIndex}`] =
            `Expression is required for ${item.item} - Answer Key ${keyIndex + 1}.`;
        }
        if (!key.grade) {
          newErrors[`answerKeyGrade-${itemIndex}-${keyIndex}`] =
            `Grade is required for ${item.item} - Answer Key ${keyIndex + 1}.`;
        }
      });
    });
  
    if (formData.answerKeys.length === 0) {
      newErrors.noAnswerKeys = "At least one answer key is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  return (
    <div className="flex flex-col p-5 gap-4 md:w-[800px] mx-auto">
      <h1 className="text-[28px] font-medium mt-2">Create Task</h1>
      {!next && (
        <div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <label className="text-md font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Laboratory Exercise #1"
                className={`placeholder-gray-500 placeholder-opacity-75 focus:placeholder-opacity-50 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg px-2 py-1 focus:outline-none text-md`}
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <h2 className="text-md font-medium">Class Group</h2>
            <Combobox
              options={classOptions}
              placeholder="Select a Class Group"
              value={formData.classId}
              onChange={(selected) => handleComboBoxChange(selected, 'classId')}
            />
            {errors.classId && <p className="text-red-500 text-sm">{errors.classId}</p>}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <h2 className="text-md font-medium">Type of Task</h2>
            <Combobox
              options={taskTypeOptions}
              placeholder="Select an examType"
              value={formData.examType}
              onChange={(selected) => handleComboBoxChange(selected, 'examType')}
            />
            {errors.examType && <p className="text-red-500 text-sm">{errors.examType}</p>}
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-md font-medium">Answer Keys</h2>
              <button
                className="flex items-center gap-2 text-blue-500 mt-2 text-sm"
                onClick={handleAddItem}
              >
                <IoIosAddCircle size={18} /> Add Item
              </button>
            </div>
            <div className="flex flex-col gap-4 mt-3">
              {errors.noAnswerKeys && <p className="text-red-500 text-sm">{errors.noAnswerKeys}</p>}
              {formData.answerKeys.map((answer, itemIndex) => (
                <div key={itemIndex} className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{answer.item}</h3>
                    {errors[`missingAnswerKey${itemIndex}`] && <p className="text-red-500 text-sm">{errors[`missingAnswerKey${itemIndex}`]}</p>}
                    <button
                      className="text-red-500"
                      onClick={() => handleRemoveItem(itemIndex)}
                    >
                      <IoMdRemoveCircle />
                    </button>
                  </div>
                  {answer.keys.map((key, keyIndex) => (
                    <div key={keyIndex} className="flex flex-col gap-2">
                      <div className="flex items-center gap-4">
                        <input
                          type="text"
                          placeholder={`Expression for Answer Key ${keyIndex + 1}`}
                          value={key.expression}
                          onChange={(e) =>
                            handleExpressionChange(itemIndex, keyIndex, "expression", e.target.value)
                          }
                          className={`border rounded-lg px-2 py-1 w-full ${errors[`answerKeyExpression-${itemIndex}-${keyIndex}`] ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <div className="w-1/4">
                          <Combobox
                            options={scoreOptions}
                            placeholder="Set Score"
                            value={key.grade}
                            onChange={(selected) =>
                              handleExpressionChange(itemIndex, keyIndex, "grade", selected?.value || "")
                            }
                          />
                        </div>
                        <button
                          className="text-black-500"
                          onClick={() => handleRemoveExpression(itemIndex, keyIndex)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                      {errors[`answerKeyExpression-${itemIndex}-${keyIndex}`] && (
                        <p className="text-red-500 text-sm">{errors[`answerKeyExpression-${itemIndex}-${keyIndex}`]}</p>
                      )}
                      {errors[`answerKeyGrade-${itemIndex}-${keyIndex}`] && (
                        <p className="text-red-500 text-sm">{errors[`answerKeyGrade-${itemIndex}-${keyIndex}`]}</p>
                      )}
                    </div>
                  ))}
                  <button
                    className="flex items-center gap-2 text-blue-500 mt-2"
                    onClick={() => handleAddExpression(itemIndex)}
                  >
                    <IoIosAddCircle size={20} /> Add Expression
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4 mt-5">
            <button
              className="px-4 py-2 bg-gray-300 rounded-lg"
              onClick={() => navigate(`/dashboard/${user.id}`)}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 bg-black text-white rounded-lg"
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>
      )}
      {next && (
        <div className="flex flex-col gap-5">
          <h2 className="text-md font-medium">{getLabelFromValue(formData.examType, taskTypeOptions)}</h2>
          <div>
            <div className="flex justify-between items-center">
              <h2 className="text-md font-medium">Class Group</h2>
              <h2 className="text-md font-medium">Due Date</h2>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between gap-5">
                <p className="font-light">{getLabelFromValue(formData.classId, classOptions)}</p>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="placeholder-gray-500 placeholder-opacity-75 focus:placeholder-opacity-50 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none text-md"
                />
              </div>
            </div>
            {errors.dueDate && <p className="text-red-500 text-sm">{errors.dueDate}</p>}
          </div>
          <div className="flex gap-4 mt-5">
            <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={() => setNext(false)}>Back</button>
            <button className="px-6 py-2 bg-black text-white rounded-lg" onClick={handleCreateTask}>Create Task</button>
          </div>
        </div>
      )}
    </div>

  );
};

export default CreateTaskPage;
