// src/hooks/useClassData.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useClassData = (classId) => {
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/classes/get-class/${classId}`);
        setClassData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  return {classData, error, loading};
};

export default useClassData;