const { Prisma } = require("@prisma/client");

function errorHandler(err, _req, res, _next) {
  if (err?.name === "ZodError") {
    return res.status(422).json({
      message: "Validation error",
      issues: err.issues,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Duplicate value" });
    }
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  return res.status(statusCode).json({ message });
}

module.exports = errorHandler;
