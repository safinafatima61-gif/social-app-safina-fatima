import { useState, useCallback, useEffect } from 'react';
import { storage, generateId } from '../services/storage';
import { createNotification } from '../utils/notificationHelpers';

export function usePosts() {
  const [posts, setPostsState] = useState(() => storage.getPosts());
  const [comments, setCommentsState] = useState(() => storage.getComments());
  const [likes, setLikesState] = useState(() => storage.getLikes());
  const [savedPosts, setSavedPosts] = useState(() => storage.getSavedPosts());

  const refresh = useCallback(() => {
    setPostsState(storage.getPosts());
    setCommentsState(storage.getComments());
    setLikesState(storage.getLikes());
    setSavedPosts(storage.getSavedPosts());
  }, []);

  useEffect(() => {
    function onStorage(e) {
      if (['posts', 'comments', 'likes', 'savedPosts'].includes(e.key)) refresh();
    }
    function onAppStorage(e) {
      if (['posts', 'comments', 'likes', 'savedPosts'].includes(e.detail?.key)) refresh();
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener('app-storage', onAppStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('app-storage', onAppStorage);
    };
  }, [refresh]);

  function createPost({ authorId, description, image, isPublic, isDraft }) {
    const all = storage.getPosts();
    const newPost = {
      id: generateId('post'),
      authorId,
      description,
      image: image || null,
      isPublic: !!isPublic,
      isDraft: !!isDraft,
      shareCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const next = [...all, newPost];
    storage.setPosts(next);
    setPostsState(next);
    return newPost;
  }

  function updatePost(postId, updates, actorId) {
    const all = storage.getPosts();
    const target = all.find((p) => p.id === postId);
    if (!target) return;
    if (actorId && target.authorId !== actorId) {
      throw new Error('You can only edit your own posts');
    }
    const next = all.map((p) =>
      p.id === postId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    storage.setPosts(next);
    setPostsState(next);
  }

  function deletePost(postId, actorId, { allowAdmin = false } = {}) {
    const all = storage.getPosts();
    const target = all.find((p) => p.id === postId);
    if (!target) return;
    if (actorId && target.authorId !== actorId && !allowAdmin) {
      throw new Error('You can only delete your own posts');
    }

    storage.setPosts(all.filter((p) => p.id !== postId));
    setPostsState(storage.getPosts());

    storage.setComments(storage.getComments().filter((c) => c.postId !== postId));
    setCommentsState(storage.getComments());

    storage.setLikes(storage.getLikes().filter((l) => l.postId !== postId));
    setLikesState(storage.getLikes());
  }

  function toggleLike(postId, userId) {
    const all = storage.getLikes();
    const existing = all.find((l) => l.postId === postId && l.userId === userId);
    let next;
    if (existing) {
      next = all.filter((l) => l.id !== existing.id);
    } else {
      next = [
        ...all,
        { id: generateId('like'), postId, userId, createdAt: new Date().toISOString() },
      ];
      const post = storage.getPosts().find((p) => p.id === postId);
      const liker = storage.getUsers().find((u) => u.id === userId);
      if (post) {
        createNotification({
          userId: post.authorId,
          type: 'like',
          fromUserId: userId,
          message: `${liker?.name || 'Someone'} liked your post`,
          link: `/posts/${postId}`,
        });
      }
    }
    storage.setLikes(next);
    setLikesState(next);
  }

  function addComment(postId, authorId, text) {
    const all = storage.getComments();
    const newComment = {
      id: generateId('cmt'),
      postId,
      authorId,
      text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const next = [...all, newComment];
    storage.setComments(next);
    setCommentsState(next);

    const post = storage.getPosts().find((p) => p.id === postId);
    const commenter = storage.getUsers().find((u) => u.id === authorId);
    if (post) {
      createNotification({
        userId: post.authorId,
        type: 'comment',
        fromUserId: authorId,
        message: `${commenter?.name || 'Someone'} commented on your post`,
        link: `/posts/${postId}`,
      });
    }
    return newComment;
  }

  function updateComment(commentId, text, actorId) {
    const all = storage.getComments();
    const target = all.find((c) => c.id === commentId);
    if (!target) return;
    if (actorId && target.authorId !== actorId) {
      throw new Error('You can only edit your own comments');
    }
    const next = all.map((c) =>
      c.id === commentId
        ? { ...c, text, updatedAt: new Date().toISOString() }
        : c
    );
    storage.setComments(next);
    setCommentsState(next);
  }

  function deleteComment(commentId, actorId) {
    const all = storage.getComments();
    const target = all.find((c) => c.id === commentId);
    if (!target) return;
    if (actorId && target.authorId !== actorId) {
      throw new Error('You can only delete your own comments');
    }
    const next = all.filter((c) => c.id !== commentId);
    storage.setComments(next);
    setCommentsState(next);
  }

  function sharePost(postId, userId) {
    const all = storage.getPosts();
    const post = all.find((p) => p.id === postId);
    if (!post) return;
    const next = all.map((p) =>
      p.id === postId ? { ...p, shareCount: (p.shareCount || 0) + 1 } : p
    );
    storage.setPosts(next);
    setPostsState(next);

    const sharer = storage.getUsers().find((u) => u.id === userId);
    createNotification({
      userId: post.authorId,
      type: 'share',
      fromUserId: userId,
      message: `${sharer?.name || 'Someone'} shared your post`,
      link: `/posts/${postId}`,
    });

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const url = `${window.location.origin}/posts/${postId}`;
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  function toggleSavePost(postId, userId) {
    const all = storage.getSavedPosts();
    const existing = all.find((s) => s.postId === postId && s.userId === userId);
    let next;
    if (existing) {
      next = all.filter((s) => s.id !== existing.id);
    } else {
      next = [
        ...all,
        {
          id: generateId('save'),
          postId,
          userId,
          createdAt: new Date().toISOString(),
        },
      ];
    }
    storage.setSavedPosts(next);
    setSavedPosts(next);
    return !existing;
  }

  function isPostSaved(postId, userId) {
    return savedPosts.some((s) => s.postId === postId && s.userId === userId);
  }

  function getCommentsForPost(postId) {
    return comments
      .filter((c) => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  function getLikesForPost(postId) {
    return likes.filter((l) => l.postId === postId);
  }

  function isLikedByUser(postId, userId) {
    return likes.some((l) => l.postId === postId && l.userId === userId);
  }

  return {
    posts,
    comments,
    likes,
    savedPosts,
    refresh,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    updateComment,
    deleteComment,
    sharePost,
    toggleSavePost,
    isPostSaved,
    getCommentsForPost,
    getLikesForPost,
    isLikedByUser,
  };
}
