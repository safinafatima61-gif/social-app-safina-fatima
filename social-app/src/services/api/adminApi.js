import api from './client';
import { ENDPOINTS } from './endpoints';

/** Admin API stubs — connect when your backend is ready */
export const adminApi = {
  stats: () => api.get(ENDPOINTS.ADMIN_STATS),
  users: () => api.get(ENDPOINTS.ADMIN_USERS),
  posts: () => api.get(ENDPOINTS.ADMIN_POSTS),
  friendRequests: () => api.get(ENDPOINTS.ADMIN_FRIEND_REQUESTS),
  friendships: () => api.get(ENDPOINTS.ADMIN_FRIENDSHIPS),
  deleteUser: (userId) => api.delete(ENDPOINTS.ADMIN_USER_BY_ID(userId)),
  deletePost: (postId) => api.delete(ENDPOINTS.ADMIN_POST_BY_ID(postId)),
  cancelFriendRequest: (requestId) =>
    api.delete(ENDPOINTS.ADMIN_FRIEND_REQUEST_BY_ID(requestId)),
  removeFriendship: (friendshipId) =>
    api.delete(ENDPOINTS.ADMIN_FRIENDSHIP_BY_ID(friendshipId)),
};
