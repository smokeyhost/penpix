import { useCallback } from 'react';
import axios from 'axios';
import { useSetRecoilState } from 'recoil';
import { TasksAtom } from '../atoms/TasksAtom'; 
import useErrorHandler from './useErrorHandler';

const useGetTasks = () => {
  const setTasks = useSetRecoilState(TasksAtom);
  const { handleError } = useErrorHandler();

  const getTasks = useCallback(async () => {
    try {
      const response = await axios.get('/task/get-tasks', { withCredentials: true });
      const tasks = response.data;
      setTasks(tasks); 
    } catch (error) {
      if (error.response.status === 401) {
        handleError('unauthorized', 'Your session has expired. Login again.');
      } else if (error.response.status === 404) {
        handleError('404', 'The resource you are looking for could not be found.');
      } else {
        handleError('default', 'An unexpected error occurred.');
      }
    }
  }, [setTasks, handleError]);

  return getTasks;
};

export default useGetTasks;

// const getTasks = useCallback(async () => {
  //   try {
  //     const response = await axios.get('/task/get-tasks', { withCredentials: true })
  //     const tasks = response.data
  //     console.log(tasks)
  //     setTasks(tasks)

  //   } catch (error) {
  //     if (error.response.status === 401) {
  //       setCurrentUser(null)
  //       localStorage.removeItem('user')
  //       handleError('unauthorized', 'Your session has expired. Login again.');
  //   }
  // }
  // }, [handleError, setCurrentUser, setTasks])