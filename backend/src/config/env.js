const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
};

const requiredVars = ["databaseUrl", "jwtSecret"];
for (const key of requiredVars) {
  if (!env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

module.exports = env;
