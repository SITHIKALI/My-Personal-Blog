/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Post, UserProfile } from '../types';
import * as dbService from '../lib/dbService';
import { renderMarkdown } from '../lib/markdown';
import { Eye, Edit3, Image, Tag, Folder, Sparkles, Check, ArrowLeft, RefreshCw, Layers } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../data/mockDefaults';

interface DashboardProps {
  editingPost: Post | null;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export default function Dashboard({ editingPost, onSaveSuccess, onCancel }: DashboardProps) {
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState(() => localStorage.getItem('blog_owner_name') || 'Blog Owner');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Load existing post if editing
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setAuthorName(editingPost.authorName || 'Blog Owner');
      setExcerpt(editingPost.excerpt);
      setContent(editingPost.content);
      setCoverImage(editingPost.coverImage || '');
      setCategory(editingPost.category);
      setTagInput(editingPost.tags.join(', '));
      setStatus(editingPost.status);
    } else {
      // Clear for new post
      setTitle('');
      // Leave authorName as saved in localStorage
      setExcerpt('');
      setContent('');
      setCoverImage('');
      setCategory(DEFAULT_CATEGORIES[0]);
      setTagInput('');
      setStatus('draft');
    }
  }, [editingPost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const tags = tagInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!slug) {
      slug = 'post-' + Math.random().toString(36).substring(2, 11);
    }

    // Persist authorName in localStorage
    localStorage.setItem('blog_owner_name', authorName.trim() || 'Blog Owner');

    try {
      const postData = {
        title: title.trim(),
        slug: slug,
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
        category,
        tags,
        status,
        authorName: authorName.trim() || 'Blog Owner',
      };

      if (editingPost) {
        // Update existing post
        await dbService.updatePost(editingPost.id, postData);
      } else {
        // Create new post
        const newPost = {
          ...postData,
          authorId: 'owner',
        };
        await dbService.createPost(newPost);
      }

      onSaveSuccess();
    } catch (err: any) {
      console.error('Error saving post: ', err);
      setError(err.message || 'Failed to save post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Pre-set some cool background cover image ideas
  const setDemoCover = (url: string) => {
    setCoverImage(url);
  };

  const demoCovers = [
    { name: 'Tech', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200' },
    { name: 'Design', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200' },
    { name: 'Space', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200' },
    { name: 'Desk', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="dashboard-writer-container">
      {/* Header and Back Link */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          id="back-to-feed-button"
        >
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </button>

        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {editingPost ? 'Edit Blog Post' : 'Create New Post'}
        </h3>
      </div>

      {error && (
        <div className="mb-6 p-4 text-xs bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'edit'
              ? 'border-slate-950 dark:border-slate-100 text-slate-950 dark:text-slate-100'
              : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
          id="dashboard-tab-edit"
        >
          <Edit3 size={14} />
          <span>Write / Code</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'preview'
              ? 'border-slate-950 dark:border-slate-100 text-slate-950 dark:text-slate-100'
              : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
          id="dashboard-tab-preview"
        >
          <Eye size={14} />
          <span>Live Markdown Preview</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'edit' ? (
          <div className="space-y-6">
            {/* Title Input */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10 Rules for Scalable Component Architectures"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-slate-800 dark:text-slate-100 font-medium border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white dark:bg-slate-900 shadow-sm transition-colors"
                  id="post-title-input"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Author / Pen Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blog Owner"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-4 py-2.5 text-slate-800 dark:text-slate-100 font-medium border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white dark:bg-slate-900 shadow-sm transition-colors"
                  id="post-author-name-input"
                />
              </div>
            </div>

            {/* Excerpt Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Excerpt / Short Summary
              </label>
              <textarea
                required
                rows={2}
                placeholder="Provide a quick 2-sentence hook that shows up in the homepage blog index."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white dark:bg-slate-900 shadow-sm resize-none transition-colors"
                id="post-excerpt-input"
              />
            </div>

            {/* Content Markdown Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Article Body (Markdown)
                </label>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  Supports headers (#), lists (*), bold (**), code (`...`)
                </span>
              </div>
              <textarea
                required
                rows={12}
                placeholder="# Introduction&#10;&#10;Write your deep markdown post here. Use code syntax formatting:&#10;&#10;```typescript&#10;const val = 'Creative';&#10;```&#10;&#10;And bold text like **this**."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 font-mono text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/20 dark:bg-slate-950/20 leading-relaxed shadow-inner"
                id="post-content-input"
              />
            </div>

            {/* Metadata Fields (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Folder size={14} className="text-slate-400 dark:text-slate-500" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  id="post-category-select"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags comma input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag size={14} className="text-slate-400 dark:text-slate-500" />
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design, WebDev, CSS"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white dark:bg-slate-900 shadow-sm transition-colors"
                  id="post-tags-input"
                />
              </div>
            </div>

            {/* Cover Image Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Image size={14} className="text-slate-400 dark:text-slate-500" />
                Featured Cover Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white dark:bg-slate-900 shadow-sm transition-colors"
                id="post-cover-input"
              />

              {/* Demo quick load cover templates */}
              <div className="flex flex-wrap gap-2 mt-2.5 items-center">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mr-1">Demo presets:</span>
                {demoCovers.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setDemoCover(item.url)}
                    className="text-[9px] font-bold px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {item.name} image
                  </button>
                ))}
              </div>
            </div>

            {/* Status toggle & action */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100/80 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Publication Status:</span>
                <div className="flex bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner transition-colors">
                  <button
                    type="button"
                    onClick={() => setStatus('draft')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      status === 'draft'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    id="status-draft-button"
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('published')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      status === 'published'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    id="status-publish-button"
                  >
                    Publish
                  </button>
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-grow sm:flex-none px-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !title.trim() || !content.trim()}
                  className="flex-grow sm:flex-none px-5 py-2 text-xs font-semibold bg-slate-950 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg transition-colors shadow-sm disabled:opacity-40 flex items-center justify-center gap-1.5"
                  id="dashboard-save-button"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      <span>Saving Article...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Save Post</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Live Markdown Preview layout */
          <div className="space-y-6">
            {/* Live mockup layout of the article */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm transition-colors">
              {coverImage && (
                <div className="aspect-video w-full overflow-hidden bg-slate-50 dark:bg-slate-950 rounded-xl mb-6">
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold">
                <span>{category}</span>
                <span>•</span>
                <span>{status} Preview</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-2 mb-4 leading-tight">
                {title || 'Untitled Article'}
              </h1>
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-mono mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
                <span>By {authorName || 'Blog Owner'}</span>
                <span>•</span>
                <span>Just now</span>
              </div>

              {/* Dynamic Render block */}
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-300">
                {content ? (
                  renderMarkdown(content)
                ) : (
                  <p className="text-slate-400 dark:text-slate-500 text-xs italic">
                    Type some content in the writer tab to preview.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className="px-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg transition-colors"
              >
                Go Back to Writer
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
