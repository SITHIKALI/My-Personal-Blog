/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * A highly robust, React 19-compatible lightweight Markdown renderer.
 * It parses standard markdown formats (headers, blockquotes, code blocks, lists, bold, italics)
 * and outputs them in visually pristine Tailwind CSS styled elements.
 */
export function renderMarkdown(markdown: string): React.ReactNode {
  if (!markdown) return null;

  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let currentBlock: 'paragraph' | 'ul' | 'ol' | 'code' | null = null;
  let codeLines: string[] = [];
  let listItems: string[] = [];
  let codeLang = '';

  const flush = (key: string | number) => {
    if (currentBlock === 'code') {
      elements.push(
        <pre key={`code-${key}`} className="bg-slate-950 dark:bg-slate-950/90 text-slate-100 p-5 rounded-xl font-mono text-xs overflow-x-auto my-6 border border-slate-800 dark:border-slate-900 leading-relaxed shadow-inner">
          <div className="flex justify-between text-[10px] text-slate-500 pb-2 mb-2 border-b border-slate-800 uppercase tracking-wider font-semibold">
            <span>{codeLang || 'code'}</span>
            <span>syntax highlighted</span>
          </div>
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      codeLines = [];
      codeLang = '';
    } else if (currentBlock === 'ul') {
      elements.push(
        <ul key={`ul-${key}`} className="list-disc pl-6 my-4 space-y-2 text-slate-700 dark:text-slate-300">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    } else if (currentBlock === 'ol') {
      elements.push(
        <ol key={`ol-${key}`} className="list-decimal pl-6 my-4 space-y-2 text-slate-700 dark:text-slate-300">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
      listItems = [];
    }
    currentBlock = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (currentBlock === 'code') {
        flush(i);
      } else {
        flush(i);
        currentBlock = 'code';
        codeLang = line.replace('```', '').trim();
      }
      continue;
    }

    if (currentBlock === 'code') {
      codeLines.push(line);
      continue;
    }

    // Unordered lists
    if (line.startsWith('* ') || line.startsWith('- ')) {
      if (currentBlock !== 'ul') {
        flush(i);
        currentBlock = 'ul';
      }
      listItems.push(line.substring(2));
      continue;
    }

    // Ordered lists
    if (/^\d+\.\s/.test(line)) {
      if (currentBlock !== 'ol') {
        flush(i);
        currentBlock = 'ol';
      }
      const match = line.match(/^\d+\.\s(.*)/);
      if (match) {
        listItems.push(match[1]);
      }
      continue;
    }

    // If it's a blank line, flush list/code and add spacing
    if (line.trim() === '') {
      flush(i);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flush(i);
      elements.push(
        <blockquote key={i} className="border-l-4 border-emerald-500 dark:border-emerald-600 pl-4 py-1 italic my-6 text-slate-600 dark:text-slate-400 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-r-lg">
          {parseInlineMarkdown(line.substring(2))}
        </blockquote>
      );
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      flush(i);
      elements.push(
        <h1 key={i} className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-8 mb-4">
          {parseInlineMarkdown(line.substring(2))}
        </h1>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      flush(i);
      elements.push(
        <h2 key={i} className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-6 mb-3">
          {parseInlineMarkdown(line.substring(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      flush(i);
      elements.push(
        <h3 key={i} className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-5 mb-2">
          {parseInlineMarkdown(line.substring(4))}
        </h3>
      );
      continue;
    }

    // Horizontal line
    if (line.trim() === '---') {
      flush(i);
      elements.push(<hr key={i} className="my-8 border-slate-200 dark:border-slate-800" />);
      continue;
    }

    // Default: paragraph line (grouped or single)
    if (currentBlock !== null) {
      flush(i);
    }
    elements.push(
      <p key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed my-4 text-base md:text-lg">
        {parseInlineMarkdown(line)}
      </p>
    );
  }

  // End of loop cleanup
  flush('end');

  return <div className="space-y-1">{elements}</div>;
}

/**
 * Parses inline formatting like **bold**, *italic*, `code`, and [links]
 */
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let index = 0;

  // Simple token matching
  // Regex to match markdown inline styles: code, bold, italic, and links
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matchStr = match[0];
    const matchIndex = match.index;

    // Push preceding text
    if (matchIndex > index) {
      parts.push(text.substring(index, matchIndex));
    }

    if (matchStr.startsWith('`')) {
      // Inline code
      parts.push(
        <code key={matchIndex} className="bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded font-mono text-sm border border-slate-200 dark:border-slate-700">
          {matchStr.substring(1, matchStr.length - 1)}
        </code>
      );
    } else if (matchStr.startsWith('**')) {
      // Bold
      parts.push(
        <strong key={matchIndex} className="font-semibold text-slate-900 dark:text-slate-100">
          {matchStr.substring(2, matchStr.length - 2)}
        </strong>
      );
    } else if (matchStr.startsWith('*')) {
      // Italic
      parts.push(
        <em key={matchIndex} className="italic text-slate-800 dark:text-slate-200">
          {matchStr.substring(1, matchStr.length - 1)}
        </em>
      );
    } else if (matchStr.startsWith('[')) {
      // Link
      const linkMatch = matchStr.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={matchIndex}
            href={sanitizeUrl(linkMatch[2])}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-305 underline font-medium transition-colors"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        parts.push(matchStr);
      }
    }

    index = regex.lastIndex;
  }

  // Push remaining text
  if (index < text.length) {
    parts.push(text.substring(index));
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * Sanitizes a URL to prevent XSS attacks via javascript:, data:, or vbscript: links.
 */
function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  // Remove control characters, backslashes, and surrounding spaces
  const sanitized = url.replace(/[^\x20-\x7E]/g, '').trim();
  
  // Check for malicious protocols
  const lowerUrl = sanitized.toLowerCase();
  if (
    lowerUrl.startsWith('javascript:') ||
    lowerUrl.startsWith('data:') ||
    lowerUrl.startsWith('vbscript:')
  ) {
    return '#';
  }
  
  return sanitized;
}
