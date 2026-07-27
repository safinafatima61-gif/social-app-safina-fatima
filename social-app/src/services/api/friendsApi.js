import api from './client';
import { ENDPOINTS } from './endpoints';

export const friendsApi = {
  people: () => api.get(ENDPOINTS.PEOPLE),
  list: () => api.get(ENDPOINTS.FRIENDS),
  requests: () => api.get(ENDPOINTS.FRIEND_REQUESTS),
  sendRequest: (toUserId) => api.post(ENDPOINTS.FRIEND_REQUESTS, { toUserId }),
  accept: (requestId) =>
    api.patch(ENDPOINTS.FRIEND_REQUEST_BY_ID(requestId), { status: 'accepted' }),
  reject: (requestId) =>
    api.patch(ENDPOINTS.FRIEND_REQUEST_BY_ID(requestId), { status: 'rejected' }),
  cancel: (requestId) => api.delete(ENDPOINTS.FRIEND_REQUEST_BY_ID(requestId)),
  unfriend: (userId) => api.delete(ENDPOINTS.UNFRIEND(userId)),
};
