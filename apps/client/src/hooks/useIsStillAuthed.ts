import { client } from '@/lib/client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useIsStillAuthed = () => {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem('accessToken')
  );
  const [refreshToken, setRefreshToken] = useState(() =>
    localStorage.getItem('refreshToken')
  );
  const [user, setUser] = useState(() => localStorage.getItem('user'));
  const isAuthed = !!accessToken && !!refreshToken && !!user;
  const refresh = useQuery({
    queryKey: ['refresh'],
    queryFn: async () => {
      try {
        const response = await client.post('auth/refresh-tokens', {
          json: { refreshToken }
        });
        const data = (await response.json()) as {
          accessToken: string;
          refreshToken: string;
        };
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return data;
      } catch (e) {
        if (accessToken) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          navigate('../signin', {
            state: {
              message: 'Session expired, please sign in again'
            }
          });
        }
        return false;
      }
    }
  });
  useQuery({
    queryKey: ['accessToken'],
    enabled: isAuthed,
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: true,
    queryFn: async () => {
      try {
        await client.get('secure', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        return false;
      } catch (e) {
        refresh.refetch();
        return true;
      }
    }
  });
  useEffect(() => {
    refresh.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);
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
  });
};
