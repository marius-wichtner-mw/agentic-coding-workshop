import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, disconnect } from '../utils/connection';
import { UserModel } from '../models/user.model';

describe('User Model', () => {
  beforeAll(async () => {
    // Connect to the database (will use in-memory MongoDB)
    await connect();
  });

  afterAll(async () => {
    await disconnect();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await UserModel.deleteMany({});
  });

  it('should create a new user successfully', async () => {
    const userData = {
      username: 'testuser',
    };

    const user = await UserModel.create(userData);

    expect(user).toBeDefined();
    expect(user.username).toBe(userData.username);
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });
});