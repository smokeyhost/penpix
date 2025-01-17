import { useState, useEffect } from 'react';
import axios from 'axios';

const useClassData = (classId) => {
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getClassData = async (classId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/classes/get-class/${classId}`);
      setClassData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      getClassData(classId);
    }
  }, [classId]);

  return { classData, error, loading, getClassData };
};

export default useClassData;