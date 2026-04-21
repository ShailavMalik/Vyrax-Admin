import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  app.listen(env.port, env.host, () => {
    console.log(`Vyra-X backend listening on http://${env.host}:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
