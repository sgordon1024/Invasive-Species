import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standalone app — separate from the public marketing site.
// Runs on its own port and deploys as its own Vercel project (root dir: platform/).
export default defineConfig({
  plugins: [react()],
  server: { port: 5180 },
});
