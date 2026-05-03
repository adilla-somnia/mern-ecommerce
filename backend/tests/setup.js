import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Redis from "ioredis-mock"; // mock do Redis
import dotenv from "dotenv";

dotenv.config();

let mongoServer;
export const redis = new Redis();

export const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

export const disconnectTestDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
  await redis.quit();
};