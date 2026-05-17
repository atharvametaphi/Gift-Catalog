let server = null;
let disconnectDatabase = null;

const stopServer = async () =>
  new Promise((resolve) => {
    if (!server) {
      resolve();
      return;
    }

    server.close(() => {
      resolve();
    });
  });

const shutdown = async (signal, error = null) => {
  if (error) {
    console.error(`[${signal}]`, error);
  } else {
    console.log(`Received ${signal}. Shutting down gracefully...`);
  }

  await stopServer().catch((closeError) => {
    console.error("Error while closing HTTP server:", closeError);
  });

  if (typeof disconnectDatabase === "function") {
    await disconnectDatabase().catch((dbError) => {
      console.error("Error while disconnecting MongoDB:", dbError);
    });
  }

  process.exit(error ? 1 : 0);
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("uncaughtException", (error) => {
  void shutdown("uncaughtException", error);
});

process.on("unhandledRejection", (error) => {
  void shutdown("unhandledRejection", error);
});

const startServer = async () => {
  try {
    const envModule = await import("./src/config/env.js");
    const env = envModule.default;
    const { validateEnv, envLoadMeta } = envModule;

    validateEnv();
    console.log(
      `Environment loaded (${envLoadMeta.source}) | NODE_ENV=${env.nodeEnv} | PORT=${env.port} | CLIENT_URL=${env.clientUrls.join(",")}`,
    );

    const databaseModule = await import("./src/config/database.js");
    const appModule = await import("./src/app.js");
    const app = appModule.default;

    disconnectDatabase = databaseModule.disconnectDatabase;

    // Ensure MongoDB is connected before the app accepts requests.
    await databaseModule.connectDatabase();

    const PORT = process.env.PORT || 5000;
    server = app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    await shutdown("startup_error", error);
  }
};

void startServer();
