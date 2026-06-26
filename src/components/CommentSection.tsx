/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Comment, UserProfile } from '../types';
import * as dbService from '../lib/dbService';
import { MessageSquare, ThumbsUp, Trash2, CornerDownRight, Reply, Send, User } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
  isAdmin?: boolean;
}

export default function CommentSection({ postId, isAdmin = false }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Track custom visitor name
  const [visitorName, setVisitorName] = useState(() => localStorage.getItem('blog_visitor_name') || '');
  
  // Track persistent visitor ID for personal recognition/replies
  const [visitorUid] = useState(() => {
    let uid = localStorage.getItem('blog_visitor_uid');
    if (!uid) {
      uid = 'visitor_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('blog_visitor_uid', uid);
    }
    return uid;
  });

  // Track which comment is receiving a reply
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyVisitorName, setReplyVisitorName] = useState(() => localStorage.getItem('blog_visitor_name') || '');

  // Fetch comments from dbService on mount / postId change
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const loadedComments = await dbService.getComments(postId);
        setComments(loadedComments);
      } catch (err) {
        console.error('Error fetching comments: ', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    const content = parentId ? replyContent : newCommentContent;
    if (!content.trim()) return;

    const chosenName = parentId 
      ? (replyVisitorName.trim() || 'Anonymous Reader')
      : (visitorName.trim() || 'Anonymous Reader');

    // Save visitor name for convenience
    localStorage.setItem('blog_visitor_name', chosenName);
    if (parentId) {
      setReplyVisitorName(chosenName);
    } else {
      setVisitorName(chosenName);
    }

    setSubmitting(true);
    try {
      const commentData = {
        postId,
        parentId,
        content: content.trim(),
        authorId: visitorUid,
        authorName: chosenName,
      };

      const newComment = await dbService.createComment(commentData);
      setComments((prev) => [...prev, newComment]);

      if (parentId) {
        setReplyContent('');
        setReplyToId(null);
      } else {
        setNewCommentContent('');
      }
    } catch (err) {
      console.error('Error adding comment: ', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const updatedComments = await Promise.all(comments.map(async (comment) => {
        if (comment.id === commentId) {
          const newClaps = comment.clapsCount + 1;
          await dbService.likeComment(commentId, newClaps);
          return { ...comment, clapsCount: newClaps };
        }
        return comment;
      }));
      setComments(updatedComments);
    } catch (err) {
      console.error('Error liking comment: ', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await dbService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));
    } catch (err) {
      console.error('Error deleting comment: ', err);
    }
  };

  // Group comments into root comments and their nested replies
  const rootComments = comments.filter((c) => !c.parentId);
  const getRepliesFor = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  return (
    <div className="border-t border-slate-100 dark:border-slate-800 pt-8 mt-12" id="comments-section-container">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={18} className="text-slate-900 dark:text-slate-100" />
        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Comments ({comments.length})
        </h4>
      </div>

      {/* Main Comment input Form */}
      <form onSubmit={(e) => handleAddComment(e, null)} className="mb-8 flex gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
          {(visitorName.trim() || 'R').charAt(0).toUpperCase()}
        </div>
        <div className="flex-grow space-y-2">
          <textarea
            rows={3}
            placeholder="Join the discussion... Share your thoughts!"
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            className="w-full p-3 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/30 dark:bg-slate-950/30 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            required
            id="comment-textarea-root"
          />
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            />
            <button
              type="submit"
              disabled={submitting || !newCommentContent.trim()}
              className="flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-slate-950 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg transition-colors shadow-sm disabled:opacity-40"
              id="comment-submit-button-root"
            >
              <Send size={12} />
              <span>Publish Comment</span>
            </button>
          </div>
        </div>
      </form>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-4 py-4">
          <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse w-2/3"></div>
          <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse w-1/2 pl-6"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-slate-400 dark:text-slate-500 text-xs text-center py-6 italic">
          No comments yet. Be the first to start the conversation!
        </p>
      ) : (
        <div className="space-y-6">
          {rootComments.map((comment) => {
            const replies = getRepliesFor(comment.id);
            // Delete comment only if logged as admin or you are the creator of this comment
            const canDelete = isAdmin || (visitorUid === comment.authorId);

            return (
              <div key={comment.id} className="space-y-4" id={`comment-node-${comment.id}`}>
                {/* Root Comment Box */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100/80 dark:border-slate-800/80 shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-600 dark:text-slate-300">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          {comment.authorName}
                          {comment.authorId.startsWith('visitor_') ? '' : ' ✍️'}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-600 rounded transition-colors"
                        title="Delete Comment"
                        id={`delete-comment-${comment.id}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed pl-1.5 whitespace-pre-wrap">
                    {comment.content}
                  </p>

                  {/* Actions: Likes & Reply trigger */}
                  <div className="flex items-center gap-4 mt-3 pl-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 border-t border-slate-50 dark:border-slate-800 pt-2.5">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      id={`like-comment-${comment.id}`}
                    >
                      <ThumbsUp size={12} />
                      <span>{comment.clapsCount}</span>
                    </button>

                    <button
                      onClick={() => {
                        setReplyToId(comment.id);
                        setReplyContent('');
                      }}
                      className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      id={`reply-trigger-${comment.id}`}
                    >
                      <Reply size={12} />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>

                {/* Reply Form Box - inline */}
                {replyToId === comment.id && (
                  <form
                    onSubmit={(e) => handleAddComment(e, comment.id)}
                    className="ml-6 pl-4 border-l-2 border-slate-100 dark:border-slate-800 py-1 space-y-2"
                    id={`reply-form-${comment.id}`}
                  >
                    <div className="flex items-start gap-2">
                      <CornerDownRight size={14} className="text-slate-400 mt-2.5 shrink-0" />
                      <div className="flex-grow">
                        <input
                          type="text"
                          placeholder={`Replying to ${comment.authorName}...`}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-100"
                          required
                          autoFocus
                          id={`reply-input-${comment.id}`}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center ml-6">
                      <input
                        type="text"
                        placeholder="Your Name (Optional)"
                        value={replyVisitorName}
                        onChange={(e) => setReplyVisitorName(e.target.value)}
                        className="px-2.5 py-1 text-[11px] border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      />
                      <div className="flex gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => setReplyToId(null)}
                          className="px-2.5 py-1 text-[10px] font-medium border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting || !replyContent.trim()}
                          className="px-3 py-1 text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1"
                          id={`reply-submit-${comment.id}`}
                        >
                          <Send size={10} />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Sub-replies (Nesting replies under parent) */}
                {replies.map((reply) => {
                  const canDeleteReply = isAdmin || (visitorUid === reply.authorId);
                  return (
                    <div
                      key={reply.id}
                      className="ml-8 pl-4 border-l-2 border-slate-100 dark:border-slate-800 flex gap-2"
                      id={`comment-reply-${reply.id}`}
                    >
                      <CornerDownRight size={14} className="text-slate-300 dark:text-slate-500 mt-3" />
                      <div className="flex-grow bg-slate-50/65 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-100/50 dark:border-slate-800/50 hover:border-slate-100 dark:hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-[8px] text-slate-500 dark:text-slate-400">
                              {reply.authorName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                                {reply.authorName}
                              </span>
                              <span className="text-[8px] text-slate-400 dark:text-slate-500 font-mono">
                                {new Date(reply.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {canDeleteReply && (
                            <button
                              onClick={() => handleDeleteComment(reply.id)}
                              className="p-0.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 rounded transition-colors"
                              title="Delete Reply"
                              id={`delete-reply-${reply.id}`}
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap pl-1">
                          {reply.content}
                        </p>

                        <div className="flex items-center gap-2 mt-2 pl-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 border-t border-slate-50 dark:border-slate-800/80 pt-1.5">
                          <button
                            onClick={() => handleLikeComment(reply.id)}
                            className="flex items-center gap-0.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            id={`like-reply-${reply.id}`}
                          >
                            <ThumbsUp size={10} />
                            <span>{reply.clapsCount}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

