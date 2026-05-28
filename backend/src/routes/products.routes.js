const { Router } = require("express");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const { authenticate, authorize } = require("../middlewares/auth");
const slugify = require("../lib/slugify");
const { AppError } = require("../lib/errors");
const { serializeProduct } = require("../lib/serializers");

const router = Router();

const CATEGORY_VALUES = ["COMPUTO", "PERIFERICOS", "GAMING", "AUDIO", "MOVIL"];

const productSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  category: z.enum(CATEGORY_VALUES).optional(),
  price: z.number().positive(),
  discountPercent: z.number().int().min(0).max(90).optional(),
  couponCode: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .optional()
    .nullable(),
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const onlyActive = req.query.active !== "false";
    const products = await prisma.product.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: products.map(serializeProduct) });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.json({ data: serializeProduct(product) });
  })
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(async (req, res) => {
    const payload = productSchema.parse(req.body);
    const normalizedPayload = {
      ...payload,
      couponCode: payload.couponCode
        ? payload.couponCode.trim().toUpperCase()
        : null,
    };
    const baseSlug = slugify(payload.name);
    const suffix = Math.random().toString(36).slice(2, 8);

    const product = await prisma.product.create({
      data: {
        ...normalizedPayload,
        slug: `${baseSlug}-${suffix}`,
      },
    });

    res.status(201).json({ data: serializeProduct(product) });
  })
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(async (req, res) => {
    const payload = productSchema.partial().parse(req.body);
    const normalizedPayload = {
      ...payload,
      couponCode:
        payload.couponCode === undefined
          ? undefined
          : payload.couponCode
            ? payload.couponCode.trim().toUpperCase()
            : null,
    };

    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      throw new AppError("Product not found", 404);
    }

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: normalizedPayload,
    });

    res.json({ data: serializeProduct(updated) });
  })
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(async (req, res) => {
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      throw new AppError("Product not found", 404);
    }

    await prisma.product.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  })
);

module.exports = router;
