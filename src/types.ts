/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'author' | 'reader';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  clapsCount: number;
  authorId: string;
  authorName: string;
  createdAt: number;
  updatedAt: number;
}

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null; // null for top-level comment, string id for reply
  content: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  clapsCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Clap {
  userId: string;
  postId: string;
  count: number;
}
