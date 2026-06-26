/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // --- Phase 3: Core API Endpoints ---
  // API Routes (Must be declared BEFORE Vite middlewares)
  
  // Health & Service Status Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: Date.now(),
      service: 'Creative Blog Full-Stack Server',
      database: 'Firebase Cloud Firestore'
    });
  });

  // Server-side SEO Meta generator endpoint (Simulated for dynamic social sharing validation)
  app.get('/api/seo/:slug', (req, res) => {
    const { slug } = req.params;
    res.json({
      title: `${slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} | Creative Blog`,
      type: 'article',
      url: `https://creative-blog.com/posts/${slug}`,
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200'
    });
  });

  // Vite development vs. production static serving configuration
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running server in Development mode with Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running server in Production mode...');
    const distPath = path.join(process.cwd(), 'dist');
    // Serve static frontend compiled assets
    app.use(express.static(distPath));
    // SPA fallback route for direct page hits on custom slugs
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`===================================================`);
    console.log(`🚀 Creative Blog Server listening on PORT ${PORT}`);
    console.log(`🔗 Live Development URL: http://localhost:${PORT}`);
    console.log(`===================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal: Failed to start full-stack server:', err);
  process.exit(1);
});
