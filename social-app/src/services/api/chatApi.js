import api from './client';
import { ENDPOINTS } from './endpoints';

export const chatApi = {
  conversations: () => api.get(ENDPOINTS.CONVERSATIONS),
  messages: (userId) => api.get(ENDPOINTS.MESSAGES(userId)),
  send: (payload) => api.post(ENDPOINTS.SEND_MESSAGE, payload),
  markRead: (userId) => api.post(ENDPOINTS.MARK_READ(userId), {}),
};
