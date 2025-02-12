import { useCallback, useState } from 'react';
import axios from 'axios';

const useTemplateDownloader = () => {
  const [loading, setLoading] = useState(false)
  const downloadTemplate = useCallback(async (taskId) => {
    setLoading(true)
    try {
      const response = await axios.get(`/task/get-template/${taskId}`, {
        responseType: 'blob'
      });

      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `grid-template.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading template:", error.message);
    } finally{
      setLoading(false)
    }
  }, []);

  return { downloadTemplate, loading };
};

export default useTemplateDownloader;
