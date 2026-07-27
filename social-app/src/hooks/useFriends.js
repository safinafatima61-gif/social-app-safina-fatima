/**
 * Friends + friend-requests state lives in FriendsContext.
 * This hook stays for existing imports; currentUserId is ignored (Auth drives context).
 */
export { useFriendsContext as useFriends, useFriendRequests } from '../context/FriendsContext';
