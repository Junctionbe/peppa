import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative asset paths so the build works whether it's served from
  // the domain root, a sub-path (e.g. https://junctionbe.github.io/peppa/),
  // or even opened from disk.
  base: './',
  build: {
    rollupOptions: {
      // Split Three.js into its own chunk so the browser caches it across
      // deployments while we iterate on the game code.
      output: {
        manualChunks: { three: ['three'] },
      },
    },
  },
});
