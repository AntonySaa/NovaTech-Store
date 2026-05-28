const jwt = require("jsonwebtoken");
const env = require("../config/env");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const { AppError } = require("../lib/errors");

const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Unauthorized", 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new AppError("Invalid token", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, fullName: true, role: true },
  });

  if (!user) {
    throw new AppError("User not found", 401);
  }

  req.user = user;
  next();
});

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new AppError("Unauthorized", 401));
  }

  if (!roles.includes(req.user.role)) {
    return next(new AppError("Forbidden", 403));
  }

  return next();
};

module.exports = {
  authenticate,
  authorize,
};
