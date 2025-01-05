import { useState } from 'react';
import axios from 'axios';
import { FilesAtom } from '../atoms/FilesAtom';
import { useRecoilState } from 'recoil';

const useFileUpload = (taskId) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useRecoilState(FilesAtom);

  const handleUpload = async (uploadFiles) => {
    const existingFileNames = files.map(file => file.filename);
    const filesToUpload = [];
    const skippedFiles = [];
  
    uploadFiles.forEach(file => {
      if (existingFileNames.includes(file.name)) {
        skippedFiles.push(file.name);
      } else {
        filesToUpload.push(file);
      }
    });
  
    if (filesToUpload.length === 0) {
      console.log('No new files to upload.');
      return;
    }
  
    const formData = new FormData();
    filesToUpload.forEach(file => {
      formData.append('files', file);
    });
    formData.append('task_id', taskId);
  
    try {
      setUploading(true);
      setError(null);
  
      const response = await axios.post('/files/upload-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
  
      setFiles((prev) => [...prev, ...response.data.files]);
      console.log('Files uploaded:', response.data.files);
      if (response.data.skipped_files.length > 0) {
        console.log('Skipped files due to duplicates:', response.data.skipped_files);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setError(error);
    } finally {
      setUploading(false);
    }
  };
  

  return { handleUpload, uploading, error };
};

export default useFileUpload;
