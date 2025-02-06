import { useCallback } from 'react';
import axios from 'axios';

const useTemplateDownloader = () => {
  const downloadTemplate = useCallback(async (taskId) => {
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
    }
  }, []);

  return { downloadTemplate };
};

export default useTemplateDownloader;
