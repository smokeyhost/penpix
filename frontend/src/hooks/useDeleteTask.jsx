import { useConfirm } from '../contexts/ConfirmContext';
import { useState } from 'react';
import axios from 'axios';
import useGetTask from './useGetTask';
import useToast from "./useToast"

const useDeleteTask = () => {
  const confirm = useConfirm();
  const {toastSuccess} = useToast()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {getTask} = useGetTask()

  const handleDeleteTask = async (taskId) => {
    setLoading(true);
    setError(null);

    try {
      const task  = await getTask(taskId);

      if (!task){
        throw new Error('Task not found')
      }

      const hasSubmissions = task.total_submissions > 0;
      const taskTitle = task.title; 
      const examType = task.exam_type;
      const verificationText = `${taskTitle}_${examType}_remove`;

      const message = hasSubmissions
        ? `This task contains submissions. Please type "${verificationText}" to confirm deletion.`
        : "Are you sure you want to delete this task?";

      const result = await confirm(message, hasSubmissions, verificationText);
      if(!result){
        setLoading(false)
        return false
      }
      const response = await axios.delete(`/task/delete-task/${taskId}`, {
        withCredentials: true,
      });
      toastSuccess('Task has been deleted successfully')
      console.log("Task deleted:", response.data);
      return true
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("An error occurred while deleting the task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    handleDeleteTask,
    loading,
    error,
  };
};

export default useDeleteTask;