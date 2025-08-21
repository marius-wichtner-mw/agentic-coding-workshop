import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UserModel } from '../models/user.model.mjs';

// Global is used here to maintain a cached connection across hot reloads
let cached = { conn: null, promise: null, mongoServer: null };

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
    const mongoServer = await MongoMemoryServer.create();
    const MONGODB_URI = mongoServer.getUri();
    cached.mongoServer = mongoServer;
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

async function testUserModel() {
  try {
    console.log('Starting User model tests...');
    
    // Connect to the database
    await connect();
    
    // Clear any existing users
    await UserModel.deleteMany({});
    console.log('Database cleared');
    
    // Test 1: Create a new user
    console.log('\nTest 1: Create a new user');
    const userData = { username: 'testuser' };
    const user = await UserModel.create(userData);
    console.log('User created:', user);
    console.assert(user.username === 'testuser', 'Username should match');
    console.assert(user.createdAt instanceof Date, 'createdAt should be a Date');
    console.assert(user.updatedAt instanceof Date, 'updatedAt should be a Date');
    
    // Test 2: Find a user by username
    console.log('\nTest 2: Find a user by username');
    const foundUser = await UserModel.findOne({ username: 'testuser' });
    console.log('Found user:', foundUser);
    console.assert(foundUser !== null, 'User should be found');
    console.assert(foundUser.username === 'testuser', 'Username should match');
    
    // Test 3: Update a user
    console.log('\nTest 3: Update a user');
    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      { username: 'updateduser' },
      { new: true }
    );
    console.log('Updated user:', updatedUser);
    console.assert(updatedUser.username === 'updateduser', 'Username should be updated');
    
    // Test 4: Unique username constraint
    console.log('\nTest 4: Unique username constraint');
    try {
      await UserModel.create({ username: 'updateduser' });
      console.error('Error: Should not allow duplicate usernames');
    } catch (error) {
      console.log('Correctly rejected duplicate username:', error.message);
    }
    
    // Test 5: Required username
    console.log('\nTest 5: Required username');
    try {
      await UserModel.create({});
      console.error('Error: Should require a username');
    } catch (error) {
      console.log('Correctly required username:', error.message);
    }
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Disconnect from the database
    await disconnect();
  }
}

// Run the tests
testUserModel();