import app from "./src/app.js";
import env from "./src/config/env.js";
import { connectDatabase } from "./src/config/database.js";

let server;

const shutdown = (signal, error = null) => {
  if (error) {
    console.error(`[${signal}]`, error);
  } else {
    console.log(`Received ${signal}. Shutting down gracefully...`);
  }

  if (server) {
    server.close(() => {
      process.exit(error ? 1 : 0);
    });
    return;
  }

  process.exit(error ? 1 : 0);
};

const startServer = async () => {
  try {
    // Ensure database is ready before the API starts accepting requests.
    await connectDatabase();
    server = app.listen(process.env.PORT || 5000, () => {
      console.log(`Server listening on port ${env.port}`);
    });
  } catch (error) {
    shutdown("startup_error", error);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("uncaughtException", (error) => shutdown("uncaughtException", error));
process.on("unhandledRejection", (error) => shutdown("unhandledRejection", error));

startServer();
