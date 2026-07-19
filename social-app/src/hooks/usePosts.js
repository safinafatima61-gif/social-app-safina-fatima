import { useState, useCallback, useEffect } from 'react';
import { storage, generateId } from '../utils/storage';

// Central CRUD helper for posts, comments and likes.
// Re-reads localStorage on every mutation so all consumers stay in sync.
export function usePosts() {
  const [posts, setPostsState] = useState(() => storage.getPosts());
  const [comments, setCommentsState] = useState(() => storage.getComments());
  const [likes, setLikesState] = useState(() => storage.getLikes());

  const refresh = useCallback(() => {
    setPostsState(storage.getPosts());
    setCommentsState(storage.getComments());
    setLikesState(storage.getLikes());
  }, []);

  useEffect(() => {
    function onStorage(e) {
      if (['posts', 'comments', 'likes'].includes(e.key)) refresh();
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  function createPost({ authorId, description, image, isPublic, isDraft }) {
    const posts = storage.getPosts();
    const newPost = {
      id: generateId('post'),
      authorId,
      description,
      image: image || null,
      isPublic: !!isPublic,
      isDraft: !!isDraft,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const next = [...posts, newPost];
    storage.setPosts(next);
    setPostsState(next);
    return newPost;
  }

  function updatePost(postId, updates) {
    const posts = storage.getPosts();
    const next = posts.map((p) =>
      p.id === postId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    storage.setPosts(next);
    setPostsState(next);
  }

  function deletePost(postId) {
    const posts = storage.getPosts().filter((p) => p.id !== postId);
    storage.setPosts(posts);
    setPostsState(posts);

    const comments = storage.getComments().filter((c) => c.postId !== postId);
    storage.setComments(comments);
    setCommentsState(comments);

    const likes = storage.getLikes().filter((l) => l.postId !== postId);
    storage.setLikes(likes);
    setLikesState(likes);
  }

  function toggleLike(postId, userId) {
    const likes = storage.getLikes();
    const existing = likes.find((l) => l.postId === postId && l.userId === userId);
    let next;
    if (existing) {
      next = likes.filter((l) => l.id !== existing.id);
    } else {
      next = [
        ...likes,
        { id: generateId('like'), postId, userId, createdAt: new Date().toISOString() },
      ];
    }
    storage.setLikes(next);
    setLikesState(next);
  }

  function addComment(postId, authorId, text) {
    const comments = storage.getComments();
    const newComment = {
      id: generateId('cmt'),
      postId,
      authorId,
      text,
      createdAt: new Date().toISOString(),
    };
    const next = [...comments, newComment];
    storage.setComments(next);
    setCommentsState(next);
    return newComment;
  }

  function deleteComment(commentId) {
    const next = storage.getComments().filter((c) => c.id !== commentId);
    storage.setComments(next);
    setCommentsState(next);
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
    refresh,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment,
    getCommentsForPost,
    getLikesForPost,
    isLikedByUser,
  };
}
