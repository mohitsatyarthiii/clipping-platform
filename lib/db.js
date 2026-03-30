import mongoose from 'mongoose';

let cachedConnection = null;
let backgroundJobsInitialized = false;

const connectDB = async () => {
  try {
    // Check if we have a cached connection
    if (cachedConnection) {
      if (cachedConnection.readyState === 1) {
        console.log('✓ Using cached database connection');
        initializeBackgroundJobs();
        return cachedConnection;
      }
    }

    // Check if mongoose already has an established connection
    if (mongoose.connections[0].readyState) {
      console.log('✓ Database already connected');
      cachedConnection = mongoose.connections[0];
      initializeBackgroundJobs();
      return cachedConnection;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: 'majority',
      waitQueueTimeoutMS: 10000,
      family: 4,
    });

    cachedConnection = conn;
    console.log('✓ Database connected successfully to MongoDB Atlas');
    console.log(`✓ Database: ${conn.connection.db.databaseName}`);

    // Initialize background jobs after successful DB connection
    initializeBackgroundJobs();

    return conn;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    throw error;
  }
};

/**
 * Initialize background jobs (only once)
 */
function initializeBackgroundJobs() {
  if (backgroundJobsInitialized || typeof window !== 'undefined') {
    return; // Already initialized or running in browser
  }

  try {
    const { initializeBackgroundJobs: startBackgroundJobs } = require('./server/workers/backgroundJobs');
    startBackgroundJobs();
    backgroundJobsInitialized = true;
  } catch (error) {
    console.warn('[DB] Could not initialize background jobs:', error.message);
    // Don't throw - background jobs are optional
  }
}

export default connectDB;
