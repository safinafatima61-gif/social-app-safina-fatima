import { storage } from '../services/storage';

function normId(id) {
  return id == null ? '' : String(id);
}

function normStatus(status) {
  return String(status || 'pending').toLowerCase().trim();
}

/** Resolve a user by id (null if missing). */
export function resolveUser(userId) {
  const id = normId(userId);
  if (!id) return null;
  return storage.getUsers().find((u) => normId(u.id) === id) || null;
}

/** Placeholder when a request references a deleted/missing user. */
export function placeholderUser(userId, label = 'Unknown user') {
  return {
    id: normId(userId) || 'unknown',
    name: label,
    email: '',
    bio: 'This account is no longer available.',
    avatar: null,
    _missing: true,
  };
}

export function resolveUserOrPlaceholder(userId, label) {
  return resolveUser(userId) || placeholderUser(userId, label);
}

function getRequestList(requests) {
  return Array.isArray(requests) ? requests : storage.getFriendRequests() || [];
}

/** Check if two users are already friends */
export function areFriends(userId1, userId2, requests = null) {
  const a = normId(userId1);
  const b = normId(userId2);
  if (!a || !b || a === b) return false;
  return getRequestList(requests).some(
    (r) =>
      normStatus(r.status) === 'accepted' &&
      ((normId(r.fromUserId) === a && normId(r.toUserId) === b) ||
        (normId(r.fromUserId) === b && normId(r.toUserId) === a))
  );
}

/** Accepted friend IDs for a user (deduped). */
export function getFriendIds(userId, requests = null) {
  const uid = normId(userId);
  if (!uid) return [];
  const ids = getRequestList(requests)
    .filter(
      (r) =>
        normStatus(r.status) === 'accepted' &&
        (normId(r.fromUserId) === uid || normId(r.toUserId) === uid)
    )
    .map((r) => (normId(r.fromUserId) === uid ? normId(r.toUserId) : normId(r.fromUserId)));
  return [...new Set(ids.filter(Boolean))];
}

/** Get all accepted friends of a user (always returns displayable user objects). */
export function getFriendsOf(userId, requests = null) {
  return getFriendIds(userId, requests).map((id) =>
    resolveUserOrPlaceholder(id, 'Friend')
  );
}

export function getFriendsCount(userId, requests = null) {
  return getFriendIds(userId, requests).length;
}

/** Pending request from A → B */
export function getPendingRequest(fromUserId, toUserId, requests = null) {
  const from = normId(fromUserId);
  const to = normId(toUserId);
  return (
    getRequestList(requests).find(
      (r) =>
        normId(r.fromUserId) === from &&
        normId(r.toUserId) === to &&
        normStatus(r.status) === 'pending'
    ) || null
  );
}

/** Relationship between current user and another user */
export function getRelationship(currentUserId, otherUserId, requests = null) {
  const me = normId(currentUserId);
  const other = normId(otherUserId);
  if (!me || !other || me === other) return 'self';
  if (areFriends(me, other, requests)) return 'friends';
  if (getPendingRequest(me, other, requests)) return 'outgoing';
  if (getPendingRequest(other, me, requests)) return 'incoming';
  return 'none';
}

/** Pending requests received by user */
export function getReceivedRequests(userId, requests = null) {
  const uid = normId(userId);
  if (!uid) return [];
  return getRequestList(requests)
    .filter((r) => normId(r.toUserId) === uid && normStatus(r.status) === 'pending')
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
}

/** Pending requests sent by user */
export function getSentRequests(userId, requests = null) {
  const uid = normId(userId);
  if (!uid) return [];
  return getRequestList(requests)
    .filter((r) => normId(r.fromUserId) === uid && normStatus(r.status) === 'pending')
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
}

/** Mutual friends count between two users */
export function getMutualFriendsCount(userId1, userId2, requests = null) {
  const friends1 = getFriendIds(userId1, requests);
  const friends2 = new Set(getFriendIds(userId2, requests));
  return friends1.filter((id) => friends2.has(id)).length;
}

/**
 * People You May Know — not self, not already friends.
 * Sort: incoming → none → outgoing.
 */
export function getPeopleSuggestions(currentUserId, requests = null) {
  const me = normId(currentUserId);
  if (!me) return [];
  const list = getRequestList(requests);

  const users = storage
    .getUsers()
    .filter((u) => normId(u.id) !== me && getRelationship(me, u.id, list) !== 'friends');

  const scored = users.map((user) => {
    const relationship = getRelationship(me, user.id, list);
    let sortOrder = 1;
    if (relationship === 'incoming') sortOrder = 0;
    else if (relationship === 'none') sortOrder = 1;
    else if (relationship === 'outgoing') sortOrder = 2;

    return {
      user,
      relationship,
      sortOrder,
      mutualCount: getMutualFriendsCount(me, user.id, list),
      hasPosts: storage.getPosts().some((p) => p.authorId === user.id && !p.isDraft),
    };
  });

  return scored.sort(
    (a, b) => a.sortOrder - b.sortOrder || a.user.name.localeCompare(b.user.name)
  );
}

/**
 * Normalize request rows only — NEVER drop accepted friendships.
 * Orphan pending/rejected rows may be removed; accepted are always kept.
 */
export function normalizeFriendRequests(raw = storage.getFriendRequests()) {
  if (!Array.isArray(raw)) return [];
  const users = storage.getUsers();
  const userIds = new Set(users.map((u) => normId(u.id)));
  const seenPending = new Set();
  const cleaned = [];

  raw.forEach((r) => {
    if (!r?.id || !r.fromUserId || !r.toUserId) return;
    const from = normId(r.fromUserId);
    const to = normId(r.toUserId);
    if (!from || !to || from === to) return;

    const status = normStatus(r.status);
    const bothExist = userIds.has(from) && userIds.has(to);

    // Keep all accepted edges (even if a user row is temporarily missing)
    if (status === 'accepted') {
      cleaned.push({
        id: r.id,
        fromUserId: from,
        toUserId: to,
        status: 'accepted',
        sentAt: r.sentAt || new Date().toISOString(),
        respondedAt: r.respondedAt || new Date().toISOString(),
      });
      return;
    }

    if (!bothExist) return;

    if (status === 'pending') {
      const key = `${from}->${to}`;
      if (seenPending.has(key)) return;
      seenPending.add(key);
    }

    cleaned.push({
      id: r.id,
      fromUserId: from,
      toUserId: to,
      status,
      sentAt: r.sentAt || new Date().toISOString(),
      respondedAt: r.respondedAt ?? null,
    });
  });

  return cleaned;
}

/** @deprecated use normalizeFriendRequests — kept for imports */
export function sanitizeFriendRequests() {
  const cleaned = normalizeFriendRequests();
  const raw = storage.getFriendRequests();
  if (JSON.stringify(cleaned) !== JSON.stringify(raw)) {
    // Write without going through helpers that re-enter listeners unnecessarily
    try {
      localStorage.setItem('friendRequests', JSON.stringify(cleaned));
    } catch {
      storage.setFriendRequests(cleaned);
    }
  }
  return cleaned;
}
