/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

function bookOgMetaPlugin() {
  return {
    name: 'book-og-meta-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        const match = url.match(/^\/books\/([a-zA-Z0-9_-]+)/);
        if (match && req.headers.accept?.includes('text/html')) {
          try {
            const bookId = match[1];
            const fs = await import('fs');
            const path = await import('path');
            const { injectBookMetaTags } = await import('./server.js');
            const templatePath = path.resolve(dirname, 'index.html');
            let rawHtml = fs.readFileSync(templatePath, 'utf-8');
            rawHtml = await server.transformIndexHtml(url, rawHtml);
            const host = req.headers.host || 'localhost:5000';
            const html = await injectBookMetaTags(rawHtml, bookId, host, 'http');
            res.setHeader('Content-Type', 'text/html');
            res.end(html);
            return;
          } catch {
            // fallback if import fails
          }
        }
        next();
      });
    }
  };
}

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), bookOgMetaPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true
  },
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});