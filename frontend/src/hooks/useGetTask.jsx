import { useState, useEffect, useCallback } from 'react';
import { FilesAtom } from '../atoms/FilesAtom'
import { useSetRecoilState } from 'recoil';
import useErrorHandler from './useErrorHandler';
import axios from 'axios';


const useGetTask = (taskId) => {
  const [task, setTask] = useState(null);
  const setFiles = useSetRecoilState(FilesAtom)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {handleError} = useErrorHandler()

  const fetchFiles = useCallback(async () => {
    try {
      const response = await axios.get(`/files/get-files/${taskId}`);
      setFiles(response.data.files);
    } catch (error) {
      setError(error);
      console.error('Error fetching files:', error);
    }
  }, [taskId]);

  const getTask = async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/task/get-task/${taskId}`, {
        withCredentials: true,
      });
      setTask(response.data);
      return response.data;
    } catch (error) {
      setError(error);
      if (error.response.status === 401) {
        localStorage.removeItem('user');
        window.location.href = "/auth";
        handleError('unauthorized', 'Your session expired. Login again.');
      } else if (error.response.status === 404) {
        handleError('404', 'The resource you are looking for could not be found.');
      } else {
        handleError('default', 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      getTask(taskId);
      fetchFiles();
    }
  }, [taskId, fetchFiles]);

  return { task, setTask, loading, error, fetchFiles, getTask};
};

export default useGetTask;
