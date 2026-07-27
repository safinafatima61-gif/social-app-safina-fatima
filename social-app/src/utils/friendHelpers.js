import { storage } from '../services/storage';

/** Check if two users are already friends */
export function areFriends(userId1, userId2) {
  const requests = storage.getFriendRequests();
  return requests.some(
    (r) =>
      r.status === 'accepted' &&
      ((r.fromUserId === userId1 && r.toUserId === userId2) ||
        (r.fromUserId === userId2 && r.toUserId === userId1))
  );
}

/** Get all accepted friends of a user (returns user objects) */
export function getFriendsOf(userId) {
  const requests = storage.getFriendRequests();
  const users = storage.getUsers();
  const friendIds = requests
    .filter(
      (r) =>
        r.status === 'accepted' &&
        (r.fromUserId === userId || r.toUserId === userId)
    )
    .map((r) => (r.fromUserId === userId ? r.toUserId : r.fromUserId));
  return users.filter((u) => friendIds.includes(u.id));
}

/** Pending request from A → B (outgoing for A) */
export function getPendingRequest(fromUserId, toUserId) {
  return storage
    .getFriendRequests()
    .find(
      (r) =>
        r.fromUserId === fromUserId &&
        r.toUserId === toUserId &&
        r.status === 'pending'
    );
}

/** Relationship between current user and another user */
export function getRelationship(currentUserId, otherUserId) {
  if (!currentUserId || !otherUserId || currentUserId === otherUserId) {
    return 'self';
  }
  if (areFriends(currentUserId, otherUserId)) return 'friends';
  if (getPendingRequest(currentUserId, otherUserId)) return 'outgoing';
  if (getPendingRequest(otherUserId, currentUserId)) return 'incoming';
  return 'none';
}

/** Pending requests received by user */
export function getReceivedRequests(userId) {
  return storage
    .getFriendRequests()
    .filter((r) => r.toUserId === userId && r.status === 'pending')
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
}

/** Pending requests sent by user */
export function getSentRequests(userId) {
  return storage
    .getFriendRequests()
    .filter((r) => r.fromUserId === userId && r.status === 'pending')
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
}

/** Mutual friends count between two users */
export function getMutualFriendsCount(userId1, userId2) {
  const friends1 = getFriendsOf(userId1).map((u) => u.id);
  const friends2 = getFriendsOf(userId2).map((u) => u.id);
  return friends1.filter((id) => friends2.includes(id)).length;
}

/**
 * People You May Know — all users except current user.
 * Sort: incoming → none → outgoing → friends.
 */
export function getPeopleSuggestions(currentUserId) {
  const users = storage.getUsers().filter((u) => u.id !== currentUserId);

  const scored = users.map((user) => {
    const relationship = getRelationship(currentUserId, user.id);
    let sortOrder = 2;
    if (relationship === 'incoming') sortOrder = 0;
    else if (relationship === 'none') sortOrder = 1;
    else if (relationship === 'outgoing') sortOrder = 2;
    else if (relationship === 'friends') sortOrder = 3;

    return {
      user,
      relationship,
      sortOrder,
      mutualCount: getMutualFriendsCount(currentUserId, user.id),
      hasPosts: storage.getPosts().some((p) => p.authorId === user.id && !p.isDraft),
    };
  });

  return scored.sort(
    (a, b) => a.sortOrder - b.sortOrder || a.user.name.localeCompare(b.user.name)
  );
}
