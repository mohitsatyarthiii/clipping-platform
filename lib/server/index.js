// lib/server/index.js
// This file is the ONLY entry point for server code
// It should NEVER be imported directly in client components

if (typeof window !== 'undefined') {
  throw new Error('Server modules cannot be imported on the client');
}

// Export all server modules from here
export { getWorker } from './workers/youtubeWorker.js';
export { default as connectDB } from './db.js';
export * from './services/earningsService.js';
export * from './services/notificationService.js';