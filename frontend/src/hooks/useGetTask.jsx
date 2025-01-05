import { useState, useEffect, useCallback } from 'react';
import { FilesAtom } from '../atoms/FilesAtom'
import { useSetRecoilState } from 'recoil';
import axios from 'axios';


const useGetTask = (taskId) => {
  const [task, setTask] = useState(null);
  const setFiles = useSetRecoilState(FilesAtom)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFiles = useCallback(async () => {
    try {
      const response = await axios.get(`/files/get-files/${taskId}`);
      setFiles(response.data.files);
    } catch (error) {
      setError(error);
      console.error('Error fetching files:', error);
    }
  }, [taskId]);

  useEffect(() => {
    const getTask = async () => {
      try {
        const response = await axios.get(`/task/get-task/${taskId}`, {
          withCredentials: true,
        });
        setTask(response.data);
      } catch (error) {
        setError(error);
        console.error('Error fetching task:', error);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      getTask();
      fetchFiles();
    }
  }, [taskId, fetchFiles]);

  return { task, setTask, loading, error, fetchFiles};
};

export default useGetTask;
