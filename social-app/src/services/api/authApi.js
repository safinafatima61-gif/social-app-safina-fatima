import api, { setAuthToken } from './client';
import { ENDPOINTS } from './endpoints';

export const authApi = {
  login: async (email, password) => {
    const data = await api.post(ENDPOINTS.LOGIN, { email, password });
    if (data?.token) setAuthToken(data.token);
    return data;
  },

  signup: async (payload) => {
    const data = await api.post(ENDPOINTS.SIGNUP, payload);
    if (data?.token) setAuthToken(data.token);
    return data;
  },

  me: () => api.get(ENDPOINTS.ME),

  logout: async () => {
    try {
      await api.post(ENDPOINTS.LOGOUT, {});
    } finally {
      setAuthToken(null);
    }
  },
};
