import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserAtom } from '../atoms/UserAtom';
import { useSetRecoilState } from 'recoil';

const useLogout = () => {
  const setUser = useSetRecoilState(UserAtom)
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post('/auth/logout');
      localStorage.removeItem('user');
      setUser(null)
      setLoading(false);
      navigate('/'); 
    } catch (error) {
      console.error('Error logging out:', error);
      setLoading(false);
    }
  };

  return {
    logout,
    loading,
  };
};

export default useLogout;
