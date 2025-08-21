// Mock mongodb-memory-server
const MongoMemoryServer = {
  create: jest.fn().mockResolvedValue({
    getUri: jest.fn().mockReturnValue("mongodb://localhost:27017/test"),
    stop: jest.fn().mockResolvedValue({}),
  }),
};

export { MongoMemoryServer };
