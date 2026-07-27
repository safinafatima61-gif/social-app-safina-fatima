import api from './client';
import { ENDPOINTS } from './endpoints';

/** Optional: call your backend AI proxy instead of OpenAI from the browser */
export const aiApi = {
  generatePost: (prompt) => api.post(ENDPOINTS.AI_POST, { prompt }),
  suggestComment: (postDescription) =>
    api.post(ENDPOINTS.AI_COMMENT, { postDescription }),
  optimiseBio: (payload) => api.post(ENDPOINTS.AI_BIO, payload),
  suggestReplies: (payload) => api.post(ENDPOINTS.AI_CHAT_SUGGEST, payload),
  autoReply: (payload) => api.post(ENDPOINTS.AI_CHAT_REPLY, payload),
};

