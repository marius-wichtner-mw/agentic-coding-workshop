import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Global is used here to maintain a cached connection across hot reloads
let cached = global.mongoose || { conn: null, promise: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let mongoServer;

/**
 * Connect to MongoDB
 */
async function connect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Create an in-memory MongoDB server for testing
    mongoServer = await MongoMemoryServer.create();
    const MONGODB_URI = mongoServer.getUri();
    console.log(`Using in-memory MongoDB at: ${MONGODB_URI}`);

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
async function disconnect() {
  if (cached.conn) {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      console.log('In-memory MongoDB server stopped');
    }
    cached.conn = null;
    cached.promise = null;
  }
}

async function testConnection() {
  try {
    console.log('Attempting to connect to in-memory MongoDB...');
    await connect();
    console.log(`MongoDB connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected'}`);
    console.log('Connection successful!');
    await disconnect();
    console.log('Disconnected successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

testConnection();