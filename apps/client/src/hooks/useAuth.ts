import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem('accessToken')
  );
  const [refreshToken, setRefreshToken] = useState(() =>
    localStorage.getItem('refreshToken')
  );
  const [user, setUser] = useState(() => localStorage.getItem('user'));
  const isAuthed = !!accessToken && !!refreshToken && !!user;

  useEffect(() => {
    const storageHandler = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        setAccessToken(e.newValue);
      }
      if (e.key === 'refreshToken') {
        setRefreshToken(e.newValue);
      }
      if (e.key === 'user') {
        setUser(e.newValue);
      }
    };
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('storage', storageHandler);
    };
  }, []);
  return isAuthed;
};
