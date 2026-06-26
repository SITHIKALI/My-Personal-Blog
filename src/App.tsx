/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Post } from './types';
import { auth } from './lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import * as dbService from './lib/dbService';
import Navbar from './components/Navbar';
import PostCard from './components/PostCard';
import PostDetail from './components/PostDetail';
import Dashboard from './components/Dashboard';
import { DEFAULT_POSTS, DEFAULT_CATEGORIES } from './data/mockDefaults';
import { BookOpen, Sparkles, Filter, RefreshCw, Layers, ShieldAlert, Check, Lock, Key } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('blog_dark_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('blog_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('blog_dark_mode', 'false');
    }
  }, [darkMode]);

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('personal_blog_admin_mode') === 'true';
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation states
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDashboardActive, setIsDashboardActive] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Filters & Discovery states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track comments counts for home feed badges
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  // Fetch Posts & Seeds default content if empty
  const fetchPostsAndSeeds = async () => {
    setLoading(true);
    try {
      if (!auth.currentUser) {
        console.log('Signing in anonymously...');
        await signInAnonymously(auth).catch((err) => {
          console.warn('Anonymous auth signin failed, continuing with local fallback:', err);
        });
      }
      const loadedPosts = await dbService.getPosts();
      setPosts(loadedPosts);

      const counts = await dbService.getAllCommentCounts();
      setCommentCounts(counts);
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostsAndSeeds();
  }, []);

  useEffect(() => {
    if (selectedPost) {
      document.title = `${selectedPost.title} | Creative Blog`;
    } else if (isDashboardActive) {
      document.title = `${editingPost ? 'Edit Post' : 'Create Post'} | Blog Dashboard`;
    } else {
      document.title = 'Creative Blog | Thoughts, Tech & Design';
    }
  }, [selectedPost, isDashboardActive, editingPost]);

  // Passcode Modal States
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  const hasPasscodeSet = !!localStorage.getItem('blog_admin_passcode_hash');

  const hashPasscode = async (text: string) => {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');

    if (!hasPasscodeSet) {
      if (!passcode) {
        setPasscodeError('Passcode cannot be empty.');
        return;
      }
      if (passcode.length < 4) {
        setPasscodeError('Passcode must be at least 4 characters long.');
        return;
      }
      if (passcode !== confirmPasscode) {
        setPasscodeError('Passcodes do not match.');
        return;
      }
      const hashed = await hashPasscode(passcode);
      localStorage.setItem('blog_admin_passcode_hash', hashed);
      localStorage.setItem('personal_blog_admin_mode', 'true');
      setIsAdmin(true);
      setShowPasscodeModal(false);
      setPasscode('');
      setConfirmPasscode('');
    } else {
      const hashed = await hashPasscode(passcode);
      const storedHash = localStorage.getItem('blog_admin_passcode_hash');
      if (hashed === storedHash) {
        localStorage.setItem('personal_blog_admin_mode', 'true');
        setIsAdmin(true);
        setShowPasscodeModal(false);
        setPasscode('');
      } else {
        setPasscodeError('Incorrect passcode. Please try again.');
      }
    }
  };

  const handleToggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      localStorage.setItem('personal_blog_admin_mode', 'false');
      setIsDashboardActive(false);
      setEditingPost(null);
    } else {
      setPasscodeError('');
      setPasscode('');
      setConfirmPasscode('');
      setShowPasscodeModal(true);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setIsDashboardActive(true);
    setSelectedPost(null);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await dbService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleSaveSuccess = () => {
    setIsDashboardActive(false);
    setEditingPost(null);
    fetchPostsAndSeeds();
  };

  // Extract all distinct tags for filtering sidebar
  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags || []))
  );

  // Filter posts based on category, tag, search query, and draft status (unless admin)
  const filteredPosts = posts.filter((post) => {
    // 1. Check publication status: only admin can view drafts
    if (post.status === 'draft' && !isAdmin) {
      return false;
    }

    // 2. Category filter
    if (selectedCategory && post.category !== selectedCategory) {
      return false;
    }

    // 3. Tag filter
    if (selectedTag && !post.tags.includes(selectedTag)) {
      return false;
    }

    // 4. Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchContent = post.content.toLowerCase().includes(q);
      const matchCategory = post.category.toLowerCase().includes(q);
      const matchTags = post.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchContent || matchCategory || matchTags;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500/10 selection:text-emerald-800 transition-colors duration-200">
      {/* Navbar Integration */}
      <Navbar
        isAdmin={isAdmin}
        onToggleAdmin={handleToggleAdmin}
        onNavigateToDashboard={() => {
          setEditingPost(null);
          setIsDashboardActive(true);
          setSelectedPost(null);
        }}
        onNavigateToHome={() => {
          setIsDashboardActive(false);
          setSelectedPost(null);
          setEditingPost(null);
        }}
        isDashboardActive={isDashboardActive}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(prev => !prev)}
      />

      {/* Main Container */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 md:px-6 py-6" id="main-content-area">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <RefreshCw className="animate-spin text-slate-800 dark:text-slate-200 mb-3" size={32} />
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Connecting to cloud database...
              </p>
            </motion.div>
          ) : isDashboardActive ? (
            /* Dashboard View */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard
                editingPost={editingPost}
                onSaveSuccess={handleSaveSuccess}
                onCancel={() => {
                  setIsDashboardActive(false);
                  setEditingPost(null);
                }}
              />
            </motion.div>
          ) : selectedPost ? (
            /* Post Detail View */
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PostDetail
                post={selectedPost}
                isAdmin={isAdmin}
                onBack={() => {
                  setSelectedPost(null);
                  fetchPostsAndSeeds(); // refresh claps count
                }}
              />
            </motion.div>
          ) : (
            /* Home Feed List View */
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              {/* Sidebar filter options */}
              <aside className="lg:col-span-1 space-y-6" id="filters-sidebar">
                {/* Hero brand card */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
                  <span className="text-[9px] font-bold px-2 py-1 bg-emerald-500 text-white rounded uppercase tracking-wider">
                    My Personal Blog
                  </span>
                  <h4 className="text-base font-extrabold tracking-tight mt-3 mb-1.5 leading-snug">
                    Creative Ideas & Writing
                  </h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed mb-4">
                    Welcome to my minimal, distraction-free blog space. Thoughts on engineering, design, and philosophy. Feel free to join discussions and like posts!
                  </p>
                  
                  
                  {isAdmin ? (
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-[8px]">
                          ✓
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] font-bold text-slate-100 block leading-tight">
                            Active Role: Blog Owner
                          </span>
                          <span className="text-[8px] text-slate-400 block">
                            You have full edit permissions
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setPasscodeError('');
                          setPasscode('');
                          setConfirmPasscode('');
                          if (confirm('Change passcode? This will clear your current passcode and prompt you to set a new one.')) {
                            localStorage.removeItem('blog_admin_passcode_hash');
                            setShowPasscodeModal(true);
                          }
                        }}
                        className="w-full text-center text-[9px] font-bold py-1 bg-slate-700/50 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors border border-slate-600/30"
                      >
                        Reset Passcode
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30 text-center">
                      <span className="text-[10px] text-slate-400 block">
                        Toggle **Owner Mode** at the top menu to create, update, or draft posts directly in the browser!
                      </span>
                    </div>
                  )}
                </div>

                {/* Categories filtering block */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-4">
                    <Filter size={14} className="text-slate-500 dark:text-slate-400" />
                    <span>Categories</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`text-left text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
                        selectedCategory === null
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                      id="category-all-button"
                    >
                      All Categories
                    </button>
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-left text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
                          selectedCategory === cat
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                        id={`category-${cat}-button`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags filtering block */}
                {allTags.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-4">
                      Explore Tags
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSelectedTag(null)}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                          selectedTag === null
                            ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900 font-bold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                        id="tag-all-button"
                      >
                        All
                      </button>
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                            selectedTag === tag
                              ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900 font-bold'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                          id={`tag-${tag}-button`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </aside>

              {/* Feed Grid cards column */}
              <section className="lg:col-span-3 space-y-6">
                {/* Search feedback heading */}
                {(selectedCategory || selectedTag || searchQuery) && (
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span>Filtering by:</span>
                      {selectedCategory && (
                        <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          Category: {selectedCategory}
                        </span>
                      )}
                      {selectedTag && (
                        <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          Tag: #{selectedTag}
                        </span>
                      )}
                      {searchQuery && (
                        <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          Search: "{searchQuery}"
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedTag(null);
                        setSearchQuery('');
                      }}
                      className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}

                {filteredPosts.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm transition-colors">
                    <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">
                      No blog articles found matching the current query.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedTag(null);
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 bg-slate-950 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold rounded-lg transition-colors"
                    >
                      Reset search filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        isAdmin={isAdmin}
                        onSelect={() => setSelectedPost(post)}
                        onEdit={() => handleEditPost(post)}
                        onDelete={() => handleDeletePost(post.id)}
                        commentsCount={commentCounts[post.id] || 0}
                      />
                    ))}
                  </div>
                )}
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 py-8 text-center text-xs text-slate-400 dark:text-slate-500 mt-12 transition-colors" id="main-footer">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p>© 2026 My Personal Blog. All rights reserved.</p>
          <div className="flex items-center justify-center gap-3 text-[10px] text-slate-300 dark:text-slate-600 font-mono">
            <span>Powered by Firestore DB</span>
            <span>•</span>
            <span>Full-Stack Vite Express</span>
            <span>•</span>
            <span>Simple & Smooth</span>
          </div>
        </div>
      </footer>

      {/* Passcode Modal Overlay */}
      {showPasscodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {hasPasscodeSet ? 'Enter Owner Passcode' : 'Set Owner Passcode'}
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {hasPasscodeSet 
                    ? 'Verify owner credentials to manage blog posts.' 
                    : 'Choose a passcode to restrict editing and deleting of articles.'}
                </p>
              </div>
            </div>

            {passcodeError && (
              <div className="mb-4 p-3 text-xs bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl font-medium">
                {passcodeError}
              </div>
            )}

            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  {hasPasscodeSet ? 'Passcode' : 'New Passcode'}
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="••••••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-4 py-2.5 text-slate-800 dark:text-slate-100 font-medium border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/30 dark:bg-slate-950/30 shadow-inner text-xs"
                />
              </div>

              {!hasPasscodeSet && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    Confirm Passcode
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    className="w-full px-4 py-2.5 text-slate-800 dark:text-slate-100 font-medium border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/30 dark:bg-slate-950/30 shadow-inner text-xs"
                  />
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasscodeModal(false);
                    setPasscode('');
                    setConfirmPasscode('');
                    setPasscodeError('');
                  }}
                  className="flex-grow px-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-grow px-4 py-2 text-xs font-semibold bg-slate-950 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl transition-colors shadow-sm"
                >
                  {hasPasscodeSet ? 'Unlock' : 'Save & Enable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
