import { useConfirm } from '../contexts/ConfirmContext';
import { useState } from 'react';
import axios from 'axios';

const useDeleteTask = () => {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDeleteTask = async (taskId) => {
    const result  = await confirm("Do you want to delete this task?");
    console.log(result)
    if (result) {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.delete(`/task/delete-task/${taskId}`, {
          withCredentials: true,
        });
        
        console.log("Task deleted:", response.data);
      } catch (err) {
        console.error("Error deleting task:", err);
        setError("An error occurred while deleting the task. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    handleDeleteTask,
    loading,
    error,
  };
};

export default useDeleteTask;
