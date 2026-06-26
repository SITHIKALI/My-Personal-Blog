/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Post } from '../types';

export const DEFAULT_POSTS: Post[] = [
  {
    id: 'default-post-1',
    title: 'The Art of Clean Code: Building Scalable Web Applications',
    slug: 'the-art-of-clean-code-building-scalable-web-applications',
    excerpt: 'Explore structural patterns, modularity, and clean practices that elevate your codebases from functioning prototypes to high-performance production systems.',
    content: `# The Art of Clean Code

Writing code is easy; writing clean, maintainable, and scalable code is an art form. In the fast-paced world of software engineering, we often prioritize speed over quality. However, taking the time to architect clean systems pays massive dividends over time.

## 1. Modularity and Separation of Concerns

A modular architecture ensures that each module or class has one, and only one, reason to change. In front-end engineering, this means:
*   Extracting heavy utility logic from UI rendering components.
*   Keeping shared state lightweight and scoped.
*   Writing isolated, pure functions that are easy to test.

## 2. Self-Documenting Code

Code should be readable like a well-written book. Rather than stuffing your codebase with comments explaining *what* a cryptic block of code does, refactor the code so its intent is immediately obvious:
*   Use expressive variable names (e.g., \`userProfileLastUpdatedAt\` instead of \`ts\`).
*   Keep functions small and focused on a single task.

\`\`\`typescript
// Bad
const d = () => { ... }

// Good
function calculateRetentionRate(activeUsers: number, totalUsers: number): number {
  if (totalUsers === 0) return 0;
  return (activeUsers / totalUsers) * 100;
}
\`\`\`

## 3. Designing for Failure

Production systems encounter unexpected payloads, flaky networks, and third-party downtime. Excellent software engineers design with failure in mind:
*   Implement lazy initialization for heavy SDK clients.
*   Gracefully fallback when an API key is missing.
*   Log structured, helpful error payloads instead of generic messages.

---

*What does clean code mean to you? Leave a comment below!*`,
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
    category: 'Engineering',
    tags: ['TypeScript', 'Architecture', 'Best Practices'],
    status: 'published',
    clapsCount: 42,
    authorId: 'system-admin',
    authorName: 'Alex Mercer (Admin)',
    createdAt: Date.now() - 3600000 * 24 * 3, // 3 days ago
    updatedAt: Date.now() - 3600000 * 24 * 3
  },
  {
    id: 'default-post-2',
    title: 'Mastering Modern UI Typography',
    slug: 'mastering-modern-ui-typography',
    excerpt: 'An in-depth look at how typeface selection, line height, scale, and negative space determine the emotional resonance and readability of user interfaces.',
    content: `# Mastering Modern UI Typography

Typography is the single most powerful tool in a designer's toolkit. It shapes the brand identity, guides visual hierarchy, and directly determines how comfortable a user feels reading your content.

## The Foundations of Elegant Type

When designing a modern interface, we must move beyond default sans-serif pairings. Consider these aspects:

### 1. The Scale & Balance
An excellent layout uses contrast in size and weight to establish a rhythm:
- **Display Headings**: High-contrast, expressive typefaces (e.g., Space Grotesk, Playfair Display) with tight letter spacing.
- **Body Copy**: Highly legible, workhorse sans-serifs (e.g., Inter, Roboto) with ample line spacing (\`line-height: 1.6\`) to prevent reader strain.

### 2. Spacing as an Active Element
Typography does not live in a vacuum; it is shaped by the negative space around it. 
*   **Tracking**: Reduce letter-spacing slightly for larger headers (\`tracking-tight\`) and increase it for small metadata or labels.
*   **Paragraph Margins**: Give paragraphs room to breathe. Avoid squeezing text blocks directly adjacent to other elements.

## Monospace Accents for Technical Context

In tech-forward designs, monospace fonts (such as Fira Code or JetBrains Mono) are beautiful accent choices. Use them for counters, dates, tags, and code blocks to add technical precision:

> "Monospace is the typeface of engineers, of builders, and of thinkers."

Let's look at a simple CSS configuration:
\`\`\`css
body {
  font-family: 'Inter', sans-serif;
  color: #1a1a1a;
  line-height: 1.7;
}
\`\`\`

---

A pristine typography configuration sets top-tier products apart. What are your favorite font combinations?`,
    coverImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200&auto=format&fit=crop&q=80',
    category: 'Design',
    tags: ['Typography', 'UI/UX', 'Product Design'],
    status: 'published',
    clapsCount: 88,
    authorId: 'system-admin',
    authorName: 'Sophia Lin (Author)',
    createdAt: Date.now() - 3600000 * 24, // 1 day ago
    updatedAt: Date.now() - 3600000 * 24
  },
  {
    id: 'default-post-3',
    title: 'The Future of Serverless Backend Architectures',
    slug: 'the-future-of-serverless-backend-architectures',
    excerpt: 'How serverless runtimes, globally distributed databases, and edge computing are shifting our understanding of cloud architecture and high availability.',
    content: `# The Future of Serverless Backend Architectures

The cloud is moving faster than ever. Historically, hosting a server meant configuring virtual machines, manually provisioning security groups, and scaling load balancers. Today, we write code, click deploy, and let container orchestration handle the rest.

## 1. What is Modern Serverless?

Traditional serverless (like raw AWS Lambda) suffered from cold starts and vendor lock-in. Modern platforms support fully isolated container systems that:
- Scale down to zero when idle.
- Spin up instances globally in milliseconds.
- Support standard frameworks (Express, NestJS, FastAPI) with zero custom adapters.

## 2. Distributed Cloud Persistence

Databases have historically been the bottleneck of serverless scales. However, cloud-native globally distributed databases (like Firestore and Google Cloud Spanner) are breaking down these barriers, providing near-infinite read scale and automatic geo-partitioning.

*   **Low Latency**: Queries run at the nearest geographic edge.
*   **Offline Support**: Seamless offline cache synchronizations in standard web/mobile clients.
*   **Managed Access**: Real-time subscriptions and declarative security rules to protect direct client operations.

Stay tuned for more updates on edge deployment workflows!`,
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    category: 'Cloud',
    tags: ['Serverless', 'Firebase', 'Systems'],
    status: 'published',
    clapsCount: 29,
    authorId: 'system-admin',
    authorName: 'Alex Mercer (Admin)',
    createdAt: Date.now() - 3600000 * 4, // 4 hours ago
    updatedAt: Date.now() - 3600000 * 4
  }
];

export const DEFAULT_CATEGORIES = [
  'Engineering',
  'Design',
  'Cloud',
  'Productivity',
  'Tech Trends'
];
