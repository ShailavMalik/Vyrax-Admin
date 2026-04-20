import mongoose from "mongoose";
import { env } from "./env.js";

let connectionPromise = null;

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
    });
  }

  return connectionPromise;
}
