import { useCallback } from 'react';
import axios from 'axios';
import { useSetRecoilState } from 'recoil';
import { ClassesAtom } from '../atoms/ClassesAtom';
import useErrorHandler from './useErrorHandler';

const useGetClasses = () => {
  const setClasses = useSetRecoilState(ClassesAtom);
  const { handleError } = useErrorHandler();

  const getClasses = useCallback(async () => {
    try {
      const response = await axios.get('/classes/get-classes');
      const classes = response.data;
      setClasses(classes); 
    } catch (error) {
      if (error.response?.status === 401) {
        handleError('unauthorized', 'Your session has expired. Login again.');
      } else if (error.response?.status === 404) {
        handleError('404', 'No classes found.');
      } else {
        handleError('default', 'An unexpected error occurred.');
      }
    }
  }, [setClasses, handleError]);

  return getClasses;
};

export default useGetClasses;
