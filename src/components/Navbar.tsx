/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, PlusCircle, Search, Sparkles, User, ShieldAlert, Check, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToHome: () => void;
  isDashboardActive: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function Navbar({
  isAdmin,
  onToggleAdmin,
  onNavigateToDashboard,
  onNavigateToHome,
  isDashboardActive,
  searchQuery,
  onSearchChange,
  darkMode,
  onToggleTheme,
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 shadow-sm transition-colors" id="main-navigation">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <button
            onClick={onNavigateToHome}
            className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 hover:opacity-85 transition-opacity"
            id="logo-button"
          >
            <div className="w-9 h-9 bg-slate-950 dark:bg-slate-100 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
              ✍️
            </div>
            <div className="text-left">
              <span className="font-bold tracking-tight text-base block">My Personal Blog</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">Insights, Ideas & Tech</span>
            </div>
          </button>

          {/* Search bar - hidden if writing in editor on dashboard */}
          {!isDashboardActive && (
            <div className="hidden sm:flex items-center relative max-w-xs w-full">
              <Search size={16} className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search articles, tags..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-700 dark:text-slate-200"
                id="search-input-navbar"
              />
            </div>
          )}

          {/* Nav Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToHome}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                !isDashboardActive
                  ? 'text-slate-950 dark:text-slate-100 bg-slate-100 dark:bg-slate-850'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
              id="nav-home-link"
            >
              Feed
            </button>

            {/* Admin or Author specific tools */}
            {isAdmin && (
              <button
                onClick={onNavigateToDashboard}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  isDashboardActive
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
                id="nav-dashboard-link"
              >
                <PlusCircle size={14} />
                <span>Write</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-all shadow-sm"
              title="Toggle Light/Dark Theme"
              id="theme-toggle-button"
            >
              {darkMode ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} />}
            </button>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

            {/* Owner Mode Toggle Button */}
            <button
              onClick={onToggleAdmin}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                isAdmin
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              id="owner-mode-toggle"
              title="Toggle Edit/Write permissions for your personal blog"
            >
              {isAdmin ? (
                <>
                  <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Owner Mode: On</span>
                  <span className="sm:hidden">Owner</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={13} className="text-slate-400 dark:text-slate-500" />
                  <span className="hidden sm:inline">Owner Mode: Off</span>
                  <span className="sm:hidden">Guest</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

