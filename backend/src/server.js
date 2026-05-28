const app = require("./app");
const env = require("./config/env");
const prisma = require("./lib/prisma");

const server = app.listen(env.port, () => {
  console.log(`API running on port ${env.port}`);
});

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
