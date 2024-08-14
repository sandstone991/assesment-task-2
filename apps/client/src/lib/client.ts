import ky from 'ky';

export const apiPrefix =
  import.meta.env.VITE_APP_API_URL ?? 'http://localhost:3000';
export const client = ky.extend({
  prefixUrl: apiPrefix + '/api'
});

export const AuthedClient = ky.extend({
  prefixUrl: apiPrefix + '/api',
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      }
    ]
  }
});
