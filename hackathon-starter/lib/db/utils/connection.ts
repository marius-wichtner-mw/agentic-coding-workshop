import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Define the type for our cached connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  mongoServer?: MongoMemoryServer;
}

// Declare global mongoose cache
declare global {
  var mongoose: MongooseCache | undefined;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
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

    // For testing or development without MONGODB_URI, use in-memory MongoDB
    if (!MONGODB_URI || process.env.NODE_ENV === 'test') {
      // Create an in-memory MongoDB server
      const mongoServer = await MongoMemoryServer.create();
      MONGODB_URI = mongoServer.getUri();
      cached.mongoServer = mongoServer;
      console.log(`Using in-memory MongoDB at: ${MONGODB_URI}`);
    } else {
      console.log(`Using MongoDB at: ${MONGODB_URI}`);
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