import API from './api';

export const loadProfile = async (session) => {
  const { data } = await API.get('/api/auth/profile', {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  return { ...data, token: session.access_token };
};
