import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Global is used here to maintain a cached connection across hot reloads
let cached = global.mongoose || { conn: null, promise: null, mongoServer: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, mongoServer: null };
}

/**
 * Connect to MongoDB
 */
export async function connect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    let MONGODB_URI = process.env.MONGODB_URI;

    // For testing or development, use in-memory MongoDB
    if (!MONGODB_URI || process.env.NODE_ENV === 'test') {
      // Create an in-memory MongoDB server
      const mongoServer = await MongoMemoryServer.create();
      MONGODB_URI = mongoServer.getUri();
      cached.mongoServer = mongoServer;
      console.log(`Using in-memory MongoDB at: ${MONGODB_URI}`);
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Disconnect from MongoDB
 */
export async function disconnect() {
  if (cached.conn) {
    await mongoose.disconnect();
    
    // Stop the in-memory MongoDB server if it exists
    if (cached.mongoServer) {
      await cached.mongoServer.stop();
      console.log('In-memory MongoDB server stopped');
      delete cached.mongoServer;
    }
    
    cached.conn = null;
    cached.promise = null;
  }
}