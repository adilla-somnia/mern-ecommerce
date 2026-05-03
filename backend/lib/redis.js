import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis =
  process.env.NODE_ENV === 'test'
    ? {
        set: async () => 'OK',
        get: async () => null,
        del: async () => 1,
      }
    : new Redis(process.env.UPSTASH_REDIS_URL);
