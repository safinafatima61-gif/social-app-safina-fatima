/**
 * API route paths — change here if your backend uses different routes.
 * Base URL comes from VITE_API_BASE_URL in .env
 */
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  ME: '/auth/me',
  LOGOUT: '/auth/logout',

  // Users / profile
  USERS: '/users',
  USER_BY_ID: (id) => `/users/${id}`,
  PROFILE: '/users/profile',

  // Posts
  POSTS: '/posts',
  POST_BY_ID: (id) => `/posts/${id}`,
  POST_LIKE: (id) => `/posts/${id}/like`,
  POST_COMMENTS: (id) => `/posts/${id}/comments`,

  // Friends
  PEOPLE: '/friends/people',
  FRIEND_REQUESTS: '/friends/requests',
  FRIENDS: '/friends',
  FRIEND_REQUEST_BY_ID: (id) => `/friends/requests/${id}`,
  UNFRIEND: (userId) => `/friends/${userId}`,

  // Chat
  CONVERSATIONS: '/chat/conversations',
  MESSAGES: (userId) => `/chat/messages/${userId}`,
  SEND_MESSAGE: '/chat/messages',
  MARK_READ: (userId) => `/chat/messages/${userId}/read`,

  // AI (backend proxies chatbot / suggestions)
  AI_POST: '/ai/post',
  AI_COMMENT: '/ai/comment',
  AI_BIO: '/ai/bio',
  AI_CHAT_SUGGEST: '/ai/chat/suggest',
  AI_CHAT_REPLY: '/ai/chat/reply',

  // Admin
  ADMIN_STATS: '/admin/stats',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_BY_ID: (id) => `/admin/users/${id}`,
  ADMIN_POSTS: '/admin/posts',
  ADMIN_POST_BY_ID: (id) => `/admin/posts/${id}`,
  ADMIN_FRIEND_REQUESTS: '/admin/friend-requests',
  ADMIN_FRIEND_REQUEST_BY_ID: (id) => `/admin/friend-requests/${id}`,
  ADMIN_FRIENDSHIPS: '/admin/friendships',
  ADMIN_FRIENDSHIP_BY_ID: (id) => `/admin/friendships/${id}`,
};
