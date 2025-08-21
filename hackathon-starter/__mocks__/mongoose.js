// Mock mongoose module
const MockSchema = jest.fn().mockImplementation((definition) => ({
  pre: jest.fn(),
  plugin: jest.fn(),
}));

const mongoose = {
  connect: jest.fn().mockResolvedValue({}),
  disconnect: jest.fn().mockResolvedValue({}),
  connection: {
    readyState: 1,
    on: jest.fn(),
    close: jest.fn(),
  },
  Schema: MockSchema,
  model: jest.fn().mockReturnValue({
    create: jest.fn().mockResolvedValue({
      _id: "mock-user-id",
      username: "testuser",
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    save: jest.fn(),
  }),
  models: {
    User: {
      create: jest.fn().mockResolvedValue({
        _id: "mock-user-id",
        username: "testuser",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      save: jest.fn(),
    },
  },
  Types: {
    ObjectId: jest.fn().mockImplementation((id) => id || "mock-object-id"),
  },
};

export default mongoose;
export { MockSchema as Schema };
