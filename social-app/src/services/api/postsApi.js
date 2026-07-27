import api from './client';
import { ENDPOINTS } from './endpoints';

export const postsApi = {
  list: (query) => api.get(ENDPOINTS.POSTS, { query }),
  getById: (id) => api.get(ENDPOINTS.POST_BY_ID(id)),
  create: (payload) => api.post(ENDPOINTS.POSTS, payload),
  update: (id, payload) => api.put(ENDPOINTS.POST_BY_ID(id), payload),
  remove: (id) => api.delete(ENDPOINTS.POST_BY_ID(id)),
  like: (id) => api.post(ENDPOINTS.POST_LIKE(id), {}),
  comments: (id) => api.get(ENDPOINTS.POST_COMMENTS(id)),
  addComment: (id, text) => api.post(ENDPOINTS.POST_COMMENTS(id), { text }),
};
