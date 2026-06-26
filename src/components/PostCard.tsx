/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Post, UserProfile } from '../types';
import { MessageSquare, ThumbsUp, Calendar, ArrowRight, Edit, Trash } from 'lucide-react';

interface PostCardProps {
  key?: string;
  post: Post;
  isAdmin?: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  commentsCount?: number;
}

export default function PostCard({ post, isAdmin = false, onSelect, onEdit, onDelete, commentsCount = 0 }: PostCardProps) {
  const isAuthor = isAdmin;
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate approximate reading time based on content length
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <article 
      className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
      id={`post-card-${post.id}`}
    >
      {/* Cover Image */}
      <div 
        onClick={onSelect}
        className="relative aspect-video w-full overflow-hidden bg-slate-50 dark:bg-slate-950 cursor-pointer"
      >
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-300 dark:text-slate-700">
            No cover image
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-bold px-2 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-md uppercase tracking-wider text-slate-800 dark:text-slate-200 shadow-sm border border-slate-200/50 dark:border-slate-750/30">
            {post.category}
          </span>
        </div>

        {post.status === 'draft' && (
          <div className="absolute top-3 right-3">
            <span className="text-[9px] font-bold px-2 py-1 bg-amber-500 text-white rounded-md uppercase tracking-wider shadow-sm">
              Draft
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 dark:text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formattedDate}
            </span>
            <span>•</span>
            <span>{readingTime} min read</span>
          </div>

          {/* Title */}
          <h4 
            onClick={onSelect}
            className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors cursor-pointer line-clamp-2 leading-snug mb-2 tracking-tight"
            id={`post-title-${post.id}`}
          >
            {post.title}
          </h4>

          {/* Excerpt */}
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3 mb-4">
            {post.excerpt}
          </p>
        </div>

        {/* Footer info & Interactions */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-auto">
          <div className="flex items-center justify-between">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-600 dark:text-slate-350">
                {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 line-clamp-1 max-w-[100px]">
                {post.authorName}
              </span>
            </div>

            {/* Interaction Stats / Edit Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
                <ThumbsUp size={12} className="text-slate-400 dark:text-slate-500" />
                <span className="font-medium text-[11px]">{post.clapsCount}</span>
              </div>
              {commentsCount > 0 && (
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
                  <MessageSquare size={12} />
                  <span className="font-medium text-[11px]">{commentsCount}</span>
                </div>
              )}

              {/* RBAC Author / Admin edits */}
              {isAuthor && (
                <div className="flex items-center gap-1 border-l border-slate-150 dark:border-slate-800 pl-2 ml-1">
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                      className="p-1 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-450 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Post"
                      id={`edit-post-${post.id}`}
                    >
                      <Edit size={13} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this blog post?')) {
                          onDelete();
                        }
                      }}
                      className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-450 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      title="Delete Post"
                      id={`delete-post-${post.id}`}
                    >
                      <Trash size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
