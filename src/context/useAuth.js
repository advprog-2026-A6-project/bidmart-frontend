import { useContext } from 'react';
import AuthContext from './authContext';

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  }

  return context;
};

export default useAuth;
