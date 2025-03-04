import { useEffect, useState } from 'react';
import api from '../../util/apislice';

const usePersistentLogin = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      setIsLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await api.get('/client/user');
        
        if (response.data && response.data.user) {
          const { name, role, email, username, department } = response.data.user;
          
          // Store user details
          sessionStorage.setItem('name', name || '');
          sessionStorage.setItem('role', role || '');
          sessionStorage.setItem('email', email || '');
          sessionStorage.setItem('username', username || '');
          sessionStorage.setItem('department', department || '');
        }
      } catch (error) {
        console.error('Error validating token:', error);
        // Don't clear tokens here - the interceptor should handle token refresh
      } finally {
        setIsLoading(false);
      }
    };

    checkLogin();
  }, []);

  return { isLoading };
};

export default usePersistentLogin;