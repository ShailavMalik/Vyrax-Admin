import mongoose from "mongoose";
import { env } from "./env.js";

let connectionPromise = null;

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    const connectOptions = {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
    };

    if (env.mongoDbName) {
      connectOptions.dbName = env.mongoDbName;
    }

    connectionPromise = mongoose
      .connect(env.mongoUri, connectOptions)
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}
