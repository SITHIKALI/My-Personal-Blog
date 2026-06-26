/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Post, UserProfile } from '../types';
import { renderMarkdown } from '../lib/markdown';
import CommentSection from './CommentSection';
import * as dbService from '../lib/dbService';
import { ArrowLeft, Calendar, Clock, ThumbsUp, Share2, Copy, Check, Twitter, Linkedin } from 'lucide-react';

interface PostDetailProps {
  post: Post;
  isAdmin?: boolean;
  onBack: () => void;
}

export default function PostDetail({ post, isAdmin = false, onBack }: PostDetailProps) {
  const [claps, setClaps] = useState(post.clapsCount);
  const [copied, setCopied] = useState(false);
  const [clapping, setClapping] = useState(false);

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate approximate reading time based on content length
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleClap = async () => {
    // Increment claps local and database
    setClaps((prev) => prev + 1);
    setClapping(true);
    setTimeout(() => setClapping(false), 300);

    try {
      await dbService.clapPost(post.id, claps + 1);
    } catch (err) {
      console.error('Error recording clap: ', err);
    }
  };

  const handleCopyLink = () => {
    // Copy current fake path to clipboard
    const simulatedUrl = `${window.location.origin}/posts/${post.slug}`;
    navigator.clipboard.writeText(simulatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8" id="post-detail-container">
      {/* Back navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-6"
        id="back-to-list-button"
      >
        <ArrowLeft size={16} />
        <span>Back to Articles</span>
      </button>

      <article className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800/80 p-5 md:p-8 shadow-sm transition-colors">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="aspect-video w-full overflow-hidden bg-slate-50 dark:bg-slate-950 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800 shadow-sm">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Categories / Tags & Metadata */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full uppercase tracking-wider">
            {post.category}
          </span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Author / Date Info line */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6 mb-8 text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300 shadow-sm">
              {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {post.authorName}
              </span>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {formattedDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {readingTime} min read
                </span>
              </div>
            </div>
          </div>

          {/* Social shares */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyLink}
              className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
                copied
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Copy URL"
              id="share-copy-button"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-[#1DA1F2] dark:hover:text-[#1DA1F2] hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-all flex items-center justify-center"
              title="Share on X / Twitter"
            >
              <Twitter size={14} />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-[#0A66C2] dark:hover:text-[#0A66C2] hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all flex items-center justify-center"
              title="Share on LinkedIn"
            >
              <Linkedin size={14} />
            </a>
          </div>
        </div>

        {/* Render Markdown Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed mb-12">
          {renderMarkdown(post.content)}
        </div>

        {/* Engagement claps buttons */}
        <div className="flex flex-col items-center border-t border-b border-slate-100 dark:border-slate-800/80 py-6 my-10 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl px-4 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-3 uppercase tracking-widest">
            Loved this article? Give it a clap!
          </p>
          <button
            onClick={handleClap}
            className={`group w-14 h-14 rounded-full flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm transition-all hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 ${
              clapping ? 'scale-110 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'active:scale-95'
            }`}
            id="clap-article-button"
          >
            <ThumbsUp
              size={20}
              className={`transition-colors ${
                clapping ? 'text-emerald-600 dark:text-emerald-400 fill-emerald-600' : 'text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
              }`}
            />
          </button>
          <span className="text-slate-700 dark:text-slate-300 text-xs font-bold font-mono mt-2" id="claps-count-display">
            {claps} claps
          </span>
        </div>

        {/* Dynamic SEO simulator box - to show users real production metadata parsing */}
        <div className="bg-slate-900 dark:bg-slate-950/80 text-slate-300 dark:text-slate-400 p-4 rounded-xl text-[10px] font-mono leading-relaxed mt-6 border border-slate-800 dark:border-slate-900/50">
          <div className="flex justify-between text-slate-500 pb-2 mb-2 border-b border-slate-800 uppercase tracking-widest font-bold">
            <span>Dynamic SEO Meta Preview</span>
            <span className="text-emerald-400">active</span>
          </div>
          <div>&lt;<span className="text-indigo-400">title</span>&gt;{post.title} | Creative Blog&lt;/<span className="text-indigo-400">title</span>&gt;</div>
          <div>&lt;<span className="text-indigo-400">meta</span> <span className="text-emerald-400">name</span>=<span className="text-pink-400">"description"</span> <span className="text-emerald-400">content</span>=<span className="text-pink-400">"{post.excerpt}"</span> /&gt;</div>
          <div>&lt;<span className="text-indigo-400">meta</span> <span className="text-emerald-400">property</span>=<span className="text-pink-400">"og:title"</span> <span className="text-emerald-400">content</span>=<span className="text-pink-400">"{post.title}"</span> /&gt;</div>
          <div>&lt;<span className="text-indigo-400">meta</span> <span className="text-emerald-400">property</span>=<span className="text-pink-400">"og:image"</span> <span className="text-emerald-400">content</span>=<span className="text-pink-400">"{post.coverImage || 'default.jpg'}"</span> /&gt;</div>
          <div>&lt;<span className="text-indigo-400">meta</span> <span className="text-emerald-400">property</span>=<span className="text-pink-400">"og:type"</span> <span className="text-emerald-400">content</span>=<span className="text-pink-400">"article"</span> /&gt;</div>
        </div>

        {/* Comments Block */}
        <CommentSection postId={post.id} isAdmin={isAdmin} />
      </article>
    </div>
  );
}
