import { FaInfoCircle, FaTrash } from "react-icons/fa";
import { IoMdRemoveCircle } from "react-icons/io";
import { IoIosAddCircle } from "react-icons/io";
import Combobox from "./components/Combobox";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import useToast from "../../hooks/useToast";
import axios from 'axios';
import { isExpressionValid, convertExpressionToServerFormat, convertExpressionToUserFormat } from "../../utils/helpers";

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

const EditTaskPage = () => {
  const [next, setNext] = useState(false);
  const navigate = useNavigate();
  const [classOptions, setClassOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const { toastSuccess } = useToast();
  const { taskId } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    classId: "",
    examType: "",
    dueDate: new Date().toISOString(),
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

  useEffect(() => {
    const getTask = async () => {
      try {
        const response = await axios.get(`/task/get-task/${taskId}`);
        const task = response.data;
        console.log(task);

        const initialData = {
          title: task.title || "",
          classId: Number(task.class_id) || "",
          examType: task.exam_type || "",
          dueDate: task.due_date ? task.due_date : new Date().toISOString().split('T')[0],
          answerKeys: task.answer_keys || [
            {
              item: `Item ${1}`,
              keys: [{ grade: "", expression: "" }],
            }
          ],
          totalSubmissions: task.total_submissions || 0,
          reviewedSubmissions: task.reviewed_submissions || 0,
          status: task.status || "Ongoing",
        };

        setFormData(initialData);
      } catch (error) {
        console.log(error);
      }
    };

    getTask();
  }, [taskId]);

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

  const handleGradeChange = (itemIndex, keyIndex, value) => {
    if (/^\d*$/.test(value)) { // Ensure the value is an integer
      handleExpressionChange(itemIndex, keyIndex, "grade", value);
    }
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

  const handleUpdateTask = async () => {
    const convertedFormData = {
      ...formData,
      answerKeys: formData.answerKeys.map((answerKey) => ({
        ...answerKey,
        keys: answerKey.keys.map((key) => ({
          ...key,
          expression: convertExpressionToServerFormat(key.expression),
        })),
      })),
    };
  
    try {
      const response = await axios.patch(`/task/edit-task/${taskId}`, convertedFormData);
      console.log(response);
      toastSuccess("The task was updated successfully.");
      navigate(`/task/${taskId}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNext = async () => {
    const isValid = await isFormValid();
    if (isValid) {
      setNext(true);
    }
  };

  const isFormValid = async () => {
    const newErrors = {};
  
    if (!formData.title.trim()) {
      newErrors.title = "Title is required.";
    } else if (formData.title.length > 30) {
      newErrors.title = "Title cannot exceed 30 characters.";
    }
  
    if (!formData.classId) {
      newErrors.classId = "Class Group is required.";
    }
  
    if (!formData.examType) {
      newErrors.examType = "Type of Task is required.";
    }
  
    if (!formData.dueDate) {
      newErrors.dueDate = "Due Date is required.";
    }
  
    for (const [itemIndex, item] of formData.answerKeys.entries()) {
      if (item.keys.length === 0) {
        newErrors[`missingAnswerKey${itemIndex}`] = `Each answer key should have at least one expression and grade.`;
      }
      for (const [keyIndex, key] of item.keys.entries()) {
        if (!key.expression.trim()) {
          newErrors[`answerKeyExpression-${itemIndex}-${keyIndex}`] =
            `Expression is required for ${item.item} - Answer Key ${keyIndex + 1}.`;
        } else if (key.expression.length > 100) {
          newErrors[`answerKeyExpression-${itemIndex}-${keyIndex}`] =
            `Expression cannot exceed 100 characters for ${item.item} - Answer Key ${keyIndex + 1}.`;
        } else {
          const serverExpression = convertExpressionToServerFormat(key.expression);
          const isValid = await isExpressionValid(serverExpression);
          if (!isValid) {
            newErrors[`answerKeyExpression-${itemIndex}-${keyIndex}`] =
              `Invalid expression for ${item.item} - Answer Key ${keyIndex + 1}. Accepted symbols: ~ | & ^. Inputs should be labeled as A, B, C, ... G.`;
          }
        }
        if (!key.grade) {
          newErrors[`answerKeyGrade-${itemIndex}-${keyIndex}`] =
            `Grade is required for ${item.item} - Answer Key ${keyIndex + 1}.`;
        }
      }
    }
  
    if (formData.answerKeys.length === 0) {
      newErrors.noAnswerKeys = "At least one answer key is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="flex flex-col p-5 gap-4 md:w-[800px] mx-auto">
      <h1 className="text-[28px] font-medium mt-2">Edit Task</h1>

      {!next && (
        <div>
          <div className="flex flex-col gap-2">
            <label className="text-md font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Laboratory Exercise #1"
              maxLength={30}
              className={`placeholder-gray-500 placeholder-opacity-75 focus:placeholder-opacity-50 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg px-2 py-1 focus:outline-none text-md`}
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
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
              placeholder="Select a Task Type"
              value={formData.examType}
              onChange={(selected) => handleComboBoxChange(selected, 'examType')}
            />
            {errors.examType && <p className="text-red-500 text-sm">{errors.examType}</p>}
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-3">
              <h2 className="text-md font-medium">Answer Keys</h2>
              <div className="relative group">
                <FaInfoCircle className="text-gray-500 cursor-pointer" />
                <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-white border border-gray-300 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-sm text-gray-700">Accepted symbols: ~ | & ^</p>
                  <p className="text-sm text-gray-700">Inputs should be labeled A, B, C, ... G</p>
                  <p className="text-sm text-gray-700">Example: A ^ B | (C & A)</p>
                </div>
              </div>
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
                          value={convertExpressionToUserFormat(key.expression)}
                          onChange={(e) =>
                            handleExpressionChange(itemIndex, keyIndex, "expression", e.target.value)
                          }
                          maxLength={500}
                          className={`border rounded-lg px-2 py-1 w-full ${
                            errors[`answerKeyExpression-${itemIndex}-${keyIndex}`]
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="Set Score"
                          value={key.grade}
                          onChange={(e) =>
                            handleGradeChange(itemIndex, keyIndex, e.target.value)
                          }
                          className={`border rounded-lg px-2 py-1 w-1/4 ${errors[`answerKeyGrade-${itemIndex}-${keyIndex}`] ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <button
                          className="text-black-500"
                          onClick={() => handleRemoveExpression(itemIndex, keyIndex)}
                        >
                          <FaTrash />
                        </button>
                      </div>

                      {errors[`answerKeyExpression-${itemIndex}-${keyIndex}`] && (
                        <p className="text-red-500 text-sm">
                          {errors[`answerKeyExpression-${itemIndex}-${keyIndex}`]}
                        </p>
                      )}
                      {errors[`answerKeyGrade-${itemIndex}-${keyIndex}`] && (
                        <p className="text-red-500 text-sm">
                          {errors[`answerKeyGrade-${itemIndex}-${keyIndex}`]}
                        </p>
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
              <button
                className="flex items-center gap-2 text-blue-500 mt-2"
                onClick={handleAddItem}
              >
                <IoIosAddCircle size={20} /> Add Item
              </button>
            </div>
          </div>

          <div className="flex gap-4 mt-5">
            <button
              className="px-4 py-2 bg-gray-300 rounded-lg"
              onClick={() => navigate(`/task/${taskId}`)}
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
          <h2 className="text-md font-medium"><span className="text-md font-medium">Task Type: </span>{getLabelFromValue(formData.examType, taskTypeOptions)}</h2>
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
            <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={() => setNext(false)}>
              Back
            </button>
            <button className="px-6 py-2 bg-black text-white rounded-lg" onClick={handleUpdateTask}>
              Save Task
            </button>
          </div>
        </div>
      )}
    </div>

  );
};

export default EditTaskPage;