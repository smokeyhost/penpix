import { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { TasksAtom } from '../../../atoms/TasksAtom';
import { formatDate } from '../../../utils/helpers';
import axios from 'axios';

const CreateTaskForm = ({ onClose }) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    classGroup: { name: '', schedule: '', dueDate: '' },
    answerKey: [{ expression: '', points: '' }],
    askBoolean: 'yes',
    status: false
  });

  const currentTasks = useRecoilValue(TasksAtom);
  const setTasks = useSetRecoilState(TasksAtom);

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      classGroup: {
        ...prevFormData.classGroup,
        dueDate: formatDate(new Date()),
      },
    }));
  }, []);

  const handleInputChange = (e, index, field, group) => {
    const { name, value } = e.target;

    if (group === 'classGroup') {
      setFormData(prevState => ({
        ...prevState,
        classGroup: {
          ...prevState.classGroup,
          [field]: value
        }
      }));
      setValidationErrors(prevErrors => ({
        ...prevErrors,
        [`${field}`]: false
      }));
    } else if (group === 'answerKey') {
      const updatedAnswerKey = formData.answerKey.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      setFormData(prevState => ({
        ...prevState,
        answerKey: updatedAnswerKey
      }));
      setValidationErrors(prevErrors => ({
        ...prevErrors,
        [`${field}-${index}`]: false
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
      setValidationErrors(prevErrors => ({
        ...prevErrors,
        [name]: false
      }));
    }
  };

  const handleAddItem = (group) => {
    if (group === 'answerKey') {
      setFormData(prevState => ({
        ...prevState,
        answerKey: [...prevState.answerKey, { expression: '', points: '' }]
      }));
    }
  };

  const handleDeleteItem = (group, index) => {
    if (group === 'answerKey') {
      // Prevent deletion if there's only one item
      if (formData.answerKey.length > 1) {
        setFormData(prevState => ({
          ...prevState,
          answerKey: prevState.answerKey.filter((_, i) => i !== index)
        }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title) {
      errors.title = true;
    }

    if (!formData.description) {
      errors.description = true;
    }

    if (!formData.classGroup.name) {
      errors.classGroupName = true;
    }

    if (!formData.classGroup.schedule) {
      errors.schedule = true;
    }

    if (!formData.classGroup.dueDate) {
      errors.dueDate = true;
    }

    if (!formData.type) {
      errors.type = true;
    }

    formData.answerKey.forEach((item, index) => {
      if (!item.expression) {
        errors[`expression-${index}`] = true;
      }
      if (!item.points) {
        errors[`points-${index}`] = true;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const transformedData = {
      title: formData.title,
      description: formData.description,
      classGroup: formData.classGroup,
      totalSubmissions: 0,
      reviewedSubmission: 0,
      dueDate: formData.classGroup.dueDate,
      status: 'Ongoing',
      type: formData.type,
      answerKeys: formData.answerKey.map(item => ({ expression: item.expression, points: item.points })),
      askBoolean: formData.askBoolean
    };

    try {
      const response = await axios.post('/task/create-task', transformedData, {
        withCredentials: true
      });

      const updatedTasks = [...currentTasks, response.data];
      setTasks(updatedTasks);
      onClose();
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-4xl h-4/5 flex flex-col overflow-auto">
        <h2 className="text-xl font-bold mb-4">Create Task</h2>
        
        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder='e.g. Laboratory Exercise #1'
              value={formData.title}
              onChange={(e) => handleInputChange(e)}
              className={`w-full px-3 py-2 border ${validationErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder='e.g. This task involves...'
              value={formData.description}
              onChange={(e) => handleInputChange(e)}
              className={`w-full px-3 py-2 border ${validationErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              rows="4"
              required
            />
          </div>

          {/* Answer Key Section */}
          <div className='Answer-key'>
            <h3 className="text-lg font-semibold mb-2">Answer Key</h3>
            {formData.answerKey.map((item, index) => (
              <div key={index} className="space-y-2">
                <label className="block text-sm font-semibold">Item {index + 1}</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder='Boolean expression'
                    value={item.expression}
                    onChange={(e) => handleInputChange(e, index, 'expression', 'answerKey')}
                    className={`w-full px-3 py-2 border ${validationErrors[`expression-${index}`] ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                    required
                  />
                  <input
                    type="number"
                    placeholder='Points'
                    value={item.points}
                    onChange={(e) => handleInputChange(e, index, 'points', 'answerKey')}
                    className={`w-full px-3 py-2 border ${validationErrors[`points-${index}`] ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                    required
                  />
                  <button
                    className={`bg-red-500 text-white px-2 py-1 rounded-md ${formData.answerKey.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => handleDeleteItem('answerKey', index)}
                    disabled={formData.answerKey.length === 1}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <button
              className="mt-2 bg-black text-white px-4 py-2 rounded-md"
              onClick={() => handleAddItem('answerKey')}
            >
              Add Item
            </button>
          </div>

          {/* Class Group Section */}
          <div className='ClassGroup'>
            <h3 className="text-lg font-semibold mb-2">Class Group</h3>
            <div className="space-y-2">
              <label className="block text-sm font-semibold mb-1" htmlFor="classGroupName">Class Name</label>
              <input
                id="classGroupName"
                name="name"
                type="text"
                placeholder='e.g. CPE 2301'
                value={formData.classGroup.name}
                onChange={(e) => handleInputChange(e, null, 'name', 'classGroup')}
                className={`w-full px-3 py-2 border ${validationErrors.classGroupName ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                required
              />
              <label className="block text-sm font-semibold mb-1" htmlFor="schedule">Schedule</label>
              <input
                id="schedule"
                name="schedule"
                type="text"
                placeholder='e.g. MW 2:00 PM - 4:00 PM'
                value={formData.classGroup.schedule}
                onChange={(e) => handleInputChange(e, null, 'schedule', 'classGroup')}
                className={`w-full px-3 py-2 border ${validationErrors.schedule ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                required
              />
              <label className="block text-sm font-semibold mb-1" htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                name="dueDate"
                type="datetime-local"
                value={formData.classGroup.dueDate}
                onChange={(e) => handleInputChange(e, null, 'dueDate', 'classGroup')}
                className={`w-full px-3 py-2 border ${validationErrors.dueDate ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                required
              />
            </div>
          </div>

          {/* Type Input */}
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="type">Type</label>
            <input
              id="type"
              name="type"
              type="text"
              placeholder='e.g. Multiple Choice'
              value={formData.type}
              onChange={(e) => handleInputChange(e)}
              className={`w-full px-3 py-2 border ${validationErrors.type ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              required
            />
          </div>

          {/* Ask Boolean Section */}
          <div>
            <label className="block text-sm font-semibold mb-1">Ask Boolean</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="askBoolean"
                  value="yes"
                  checked={formData.askBoolean === 'yes'}
                  onChange={(e) => handleInputChange(e)}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="askBoolean"
                  value="no"
                  checked={formData.askBoolean === 'no'}
                  onChange={(e) => handleInputChange(e)}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 mt-4">
            <button
              className="bg-black text-white px-4 py-2 rounded-md"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-md"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskForm;
