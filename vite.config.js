import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative asset paths so the build works whether it's served from
  // the domain root, a sub-path (e.g. https://junctionbe.github.io/peppa/),
  // or even opened from disk.
  base: './',
});
