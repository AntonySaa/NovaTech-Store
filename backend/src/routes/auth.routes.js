const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const { AppError } = require("../lib/errors");
const env = require("../config/env");
const { authenticate } = require("../middlewares/auth");

const router = Router();

const registerSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const googleLoginSchema = z.object({
  idToken: z.string().min(10),
});

const googleClient = new OAuth2Client();

function signAccessToken(user) {
  return jwt.sign({ role: user.role, email: user.email }, env.jwtSecret, {
    subject: user.id,
    expiresIn: env.jwtExpiresIn,
  });
}

function toPublicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() },
    });

    if (existing) {
      throw new AppError("Email already registered", 409);
    }

    const hash = await bcrypt.hash(payload.password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: payload.fullName,
        email: payload.email.toLowerCase(),
        passwordHash: hash,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

    await prisma.cart.create({
      data: { userId: user.id },
    });

    const token = signAccessToken(user);
    res.status(201).json({ user, token });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() },
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isValid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = signAccessToken(user);
    res.json({ user: toPublicUser(user), token });
  })
);

router.post(
  "/google",
  asyncHandler(async (req, res) => {
    if (!env.googleClientId) {
      throw new AppError("Google login is not configured", 500);
    }

    const payload = googleLoginSchema.parse(req.body);

    const ticket = await googleClient.verifyIdToken({
      idToken: payload.idToken,
      audience: env.googleClientId,
    });

    const googlePayload = ticket.getPayload();
    const email = googlePayload?.email?.toLowerCase();
    const emailVerified = googlePayload?.email_verified;
    const name = googlePayload?.name;

    if (!email || !emailVerified) {
      throw new AppError("Google account is not valid", 401);
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const defaultName = email.split("@")[0];

      user = await prisma.user.create({
        data: {
          fullName: name || defaultName,
          email,
          passwordHash,
        },
      });
    }

    await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    const token = signAccessToken(user);
    res.json({ user: toPublicUser(user), token });
  })
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

module.exports = router;
