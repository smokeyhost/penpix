import { useState } from 'react';
import axios from 'axios';

const useDeleteFile = (refreshFiles) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDeleteFile = async (fileId) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/files/delete-file/${fileId}`);
      refreshFiles(); // Refresh the file list
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('An error occurred while deleting the file.');
    } finally {
      setLoading(false);
    }
  };

  return {
    handleDeleteFile,
    loading,
    error,
  };
};

export default useDeleteFile;
