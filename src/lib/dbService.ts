/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from './firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy, writeBatch } from 'firebase/firestore';
import { Post, Comment } from '../types';
import { DEFAULT_POSTS } from '../data/mockDefaults';

let useLocalStorage = false;

// Check if we should fallback
export function isLocalStorageMode() {
  return useLocalStorage;
}

export function setLocalStorageMode(val: boolean) {
  useLocalStorage = val;
  if (val) {
    console.warn('Firebase Firestore is unavailable or restricted. Falling back to LocalStorage Mode.');
  }
}

// LocalStorage keys
const STORAGE_POSTS_KEY = 'blog_local_posts';
const STORAGE_COMMENTS_KEY = 'blog_local_comments';

function getLocalPosts(): Post[] {
  const data = localStorage.getItem(STORAGE_POSTS_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(DEFAULT_POSTS));
    return DEFAULT_POSTS;
  }
  return JSON.parse(data);
}

function saveLocalPosts(posts: Post[]) {
  localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
}

function getLocalComments(): Comment[] {
  const data = localStorage.getItem(STORAGE_COMMENTS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveLocalComments(comments: Comment[]) {
  localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(comments));
}

export async function getPosts(): Promise<Post[]> {
  if (useLocalStorage) {
    return getLocalPosts().sort((a, b) => b.createdAt - a.createdAt);
  }
  try {
    const postsSnapshot = await getDocs(collection(db, 'posts'));
    let loadedPosts: Post[] = [];
    postsSnapshot.forEach((doc) => {
      loadedPosts.push({ id: doc.id, ...doc.data() } as Post);
    });

    if (loadedPosts.length === 0) {
      console.log('Seeding default articles into Firestore...');
      const batch = writeBatch(db);
      for (const defaultPost of DEFAULT_POSTS) {
        const postRef = doc(collection(db, 'posts'), defaultPost.id);
        batch.set(postRef, defaultPost);
        loadedPosts.push(defaultPost);
      }
      await batch.commit();
    }
    
    // Cache online posts to LocalStorage
    saveLocalPosts(loadedPosts);

    return loadedPosts.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error('Firestore getPosts failed, falling back to LocalStorage:', err);
    setLocalStorageMode(true);
    return getPosts();
  }
}

export async function createPost(postData: Omit<Post, 'id' | 'clapsCount' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Post> {
  const newPost: Post = {
    ...postData,
    id: postData.id || 'post_' + Math.random().toString(36).substring(2, 11),
    clapsCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (useLocalStorage) {
    const posts = getLocalPosts();
    posts.push(newPost);
    saveLocalPosts(posts);
    return newPost;
  }

  try {
    const docRef = await addDoc(collection(db, 'posts'), newPost);
    newPost.id = docRef.id;
    
    // Sync to LocalStorage
    const posts = getLocalPosts();
    posts.push(newPost);
    saveLocalPosts(posts);

    return newPost;
  } catch (err) {
    console.error('Firestore createPost failed, falling back to LocalStorage:', err);
    setLocalStorageMode(true);
    return createPost(postData);
  }
}

export async function updatePost(id: string, postData: Partial<Post>): Promise<void> {
  if (useLocalStorage) {
    const posts = getLocalPosts();
    const idx = posts.findIndex(p => p.id === id);
    if (idx !== -1) {
      posts[idx] = { ...posts[idx], ...postData, updatedAt: Date.now() };
      saveLocalPosts(posts);
    }
    return;
  }

  try {
    const postRef = doc(db, 'posts', id);
    await updateDoc(postRef, { ...postData, updatedAt: Date.now() });

    // Sync to LocalStorage
    const posts = getLocalPosts();
    const idx = posts.findIndex(p => p.id === id);
    if (idx !== -1) {
      posts[idx] = { ...posts[idx], ...postData, updatedAt: Date.now() };
      saveLocalPosts(posts);
    }
  } catch (err) {
    console.error('Firestore updatePost failed, falling back to LocalStorage:', err);
    setLocalStorageMode(true);
    return updatePost(id, postData);
  }
}

export async function deletePost(id: string): Promise<void> {
  if (useLocalStorage) {
    const posts = getLocalPosts();
    saveLocalPosts(posts.filter(p => p.id !== id));
    
    // Also delete associated comments
    const comments = getLocalComments();
    saveLocalComments(comments.filter(c => c.postId !== id));
    return;
  }

  try {
    await deleteDoc(doc(db, 'posts', id));

    // Sync to LocalStorage
    const posts = getLocalPosts();
    saveLocalPosts(posts.filter(p => p.id !== id));
    
    const comments = getLocalComments();
    saveLocalComments(comments.filter(c => c.postId !== id));
  } catch (err) {
    console.error('Firestore deletePost failed, falling back to LocalStorage:', err);
    setLocalStorageMode(true);
    return deletePost(id);
  }
}

export async function clapPost(id: string, newClaps: number): Promise<void> {
  if (useLocalStorage) {
    const posts = getLocalPosts();
    const idx = posts.findIndex(p => p.id === id);
    if (idx !== -1) {
      posts[idx].clapsCount = newClaps;
      saveLocalPosts(posts);
    }
    return;
  }

  try {
    const postRef = doc(db, 'posts', id);
    await updateDoc(postRef, { clapsCount: newClaps });

    // Sync to LocalStorage
    const posts = getLocalPosts();
    const idx = posts.findIndex(p => p.id === id);
    if (idx !== -1) {
      posts[idx].clapsCount = newClaps;
      saveLocalPosts(posts);
    }
  } catch (err) {
    console.error('Firestore clapPost failed, falling back to LocalStorage:', err);
    setLocalStorageMode(true);
    return clapPost(id, newClaps);
  }
}

export async function getComments(postId: string): Promise<Comment[]> {
  if (useLocalStorage) {
    return getLocalComments().filter(c => c.postId === postId).sort((a, b) => a.createdAt - b.createdAt);
  }

  try {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const loadedComments: Comment[] = [];
    querySnapshot.forEach((doc) => {
      loadedComments.push({ id: doc.id, ...doc.data() } as Comment);
    });

    // Cache to LocalStorage: merge by replacing comments for this postId
    const otherComments = getLocalComments().filter(c => c.postId !== postId);
    saveLocalComments([...otherComments, ...loadedComments]);

    return loadedComments.sort((a, b) => a.createdAt - b.createdAt);
  } catch (err) {
    console.error('Firestore getComments failed, falling back to LocalStorage:', err);
    setLocalStorageMode(true);
    return getComments(postId);
  }
}

export async function getAllCommentCounts(): Promise<Record<string, number>> {
  if (useLocalStorage) {
    const counts: Record<string, number> = {};
    getLocalComments().forEach(c => {
      if (c.postId) {
        counts[c.postId] = (counts[c.postId] || 0) + 1;
      }
    });
    return counts;
  }

  try {
    const commentsSnapshot = await getDocs(collection(db, 'comments'));
    const loadedComments: Comment[] = [];
    const counts: Record<string, number> = {};
    commentsSnapshot.forEach((doc) => {
      const c = { id: doc.id, ...doc.data() } as Comment;
      loadedComments.push(c);
      if (c.postId) {
        counts[c.postId] = (counts[c.postId] || 0) + 1;
      }
    });

    // Cache comments to LocalStorage
    saveLocalComments(loadedComments);

    return counts;
  } catch (err) {
    console.error('Firestore getAllCommentCounts failed, falling back to LocalStorage:', err);
    setLocalStorageMode(true);
    return getAllCommentCounts();
  }
}

export async function createComment(commentData: Omit<Comment, 'id' | 'clapsCount' | 'createdAt'>): Promise<Comment> {
  const newComment: Comment = {
    ...commentData,
    id: 'comment_' + Math.random().toString(36).substring(2, 11),
    clapsCount: 0,
    createdAt: Date.now(),
  };

  if (useLocalStorage) {
    const comments = getLocalComments();
    comments.push(newComment);
    saveLocalComments(comments);
    return newComment;
  }

  try {
    const docRef = await addDoc(collection(db, 'comments'), newComment);
    newComment.id = docRef.id;

    // Sync to LocalStorage
    const comments = getLocalComments();
    comments.push(newComment);
    saveLocalComments(comments);

    return newComment;
  } catch (err) {
    console.error('Firestore createComment failed, falling back to LocalStorage:', err);
    setLocalStorageMode(true);
    return createComment(commentData);
  }
}

export async function likeComment(commentId: string, newClaps: number): Promise<void> {
  if (useLocalStorage) {
    const comments = getLocalComments();
    const idx = comments.findIndex(c => c.id === commentId);
    if (idx !== -1) {
      comments[idx].clapsCount = newClaps;
      saveLocalComments(comments);
    }
    return;
  }

  try {
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, { clapsCount: newClaps });

    // Sync to LocalStorage
    const comments = getLocalComments();
    const idx = comments.findIndex(c => c.id === commentId);
    if (idx !== -1) {
      comments[idx].clapsCount = newClaps;
      saveLocalComments(comments);
    }
  } catch (err) {
    console.error('Firestore likeComment failed, falling back to LocalStorage:', err);
    setLocalStorageMode(true);
    return likeComment(commentId, newClaps);
  }
}

export async function deleteComment(commentId: string): Promise<void> {
  if (useLocalStorage) {
    const comments = getLocalComments();
    saveLocalComments(comments.filter(c => c.id !== commentId && c.parentId !== commentId));
    return;
  }

  try {
    await deleteDoc(doc(db, 'comments', commentId));

    // Sync to LocalStorage
    const comments = getLocalComments();
    saveLocalComments(comments.filter(c => c.id !== commentId && c.parentId !== commentId));
  } catch (err) {
    console.error('Firestore deleteComment failed, falling back to LocalStorage:', err);
    setLocalStorageMode(true);
    return deleteComment(commentId);
  }
}
