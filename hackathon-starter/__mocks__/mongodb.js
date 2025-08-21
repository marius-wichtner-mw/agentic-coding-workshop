// Mock mongodb module
const MongoClient = jest.fn().mockImplementation(() => ({
  connect: jest.fn().mockResolvedValue({}),
  db: jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnValue({
      insertOne: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    }),
  }),
  close: jest.fn(),
}));

export { MongoClient };
export default { MongoClient };
