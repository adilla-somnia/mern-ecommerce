import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import Redis from "ioredis-mock";

let mongoServer;
export const redis = new Redis();

export const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

export const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};