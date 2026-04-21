import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";

const DB_RETRY_DELAY_MS = 5000;

function scheduleDatabaseConnect() {
  connectDatabase()
    .then(() => {
      console.log("MongoDB connection established");
    })
    .catch((error) => {
      console.error("MongoDB connection failed, retrying...", error);
      setTimeout(scheduleDatabaseConnect, DB_RETRY_DELAY_MS);
    });
}

function bootstrap() {
  const app = createApp();

  app.listen(env.port, env.host, () => {
    console.log(`Vyra-X backend listening on http://${env.host}:${env.port}`);
    scheduleDatabaseConnect();
  });
}

bootstrap();
