import { AuthedClient } from '@/lib/client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export const useIsStillAuthed = () => {
  const navigate = useNavigate();

  useQuery({
    queryKey: [],
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: true,
    queryFn: async () => {
      try {
        await AuthedClient.get('secure');
        return 'authed';
      } catch (e) {
        try {
          const response = await AuthedClient.post('auth/refresh-tokens', {
            json: { refreshToken: localStorage.getItem('refreshToken') }
          });
          const data = (await response.json()) as {
            accessToken: string;
            refreshToken: string;
          };
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          return 'refreshed';
        } catch (e) {
          const accessToken = localStorage.getItem('accessToken');
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
          return 'unauthed';
        }
      }
    }
  });
};
