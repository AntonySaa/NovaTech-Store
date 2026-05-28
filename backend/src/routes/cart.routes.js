const { Router } = require("express");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const { AppError } = require("../lib/errors");
const { authenticate } = require("../middlewares/auth");
const { toNumber } = require("../lib/serializers");

const router = Router();

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(1),
});

async function ensureUserCart(userId) {
  const existing = await prisma.cart.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.cart.create({
    data: { userId },
  });
}

function getFinalPrice(product) {
  const basePrice = toNumber(product.price);
  const discountPercent = Number(product.discountPercent || 0);
  if (discountPercent <= 0) return basePrice;
  return Number((basePrice * (1 - discountPercent / 100)).toFixed(2));
}

router.use(authenticate);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const cart = await ensureUserCart(req.user.id);
    const items = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    const data = items.map((item) => {
      const unitPrice = getFinalPrice(item.product);
      return {
        id: item.id,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: toNumber(item.product.price),
          finalPrice: unitPrice,
          discountPercent: Number(item.product.discountPercent || 0),
          couponCode: item.product.couponCode,
          imageUrl: item.product.imageUrl,
          stock: item.product.stock,
        },
        subtotal: Number((unitPrice * item.quantity).toFixed(2)),
      };
    });

    const total = Number(
      data.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2)
    );

    res.json({ data, total });
  })
);

router.post(
  "/items",
  asyncHandler(async (req, res) => {
    const payload = addItemSchema.parse(req.body);
    const cart = await ensureUserCart(req.user.id);

    const product = await prisma.product.findUnique({
      where: { id: payload.productId },
    });

    if (!product || !product.isActive) {
      throw new AppError("Product not found", 404);
    }

    if (product.stock < payload.quantity) {
      throw new AppError("Insufficient stock", 409);
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: payload.productId,
        },
      },
    });

    const finalQuantity = (existing?.quantity || 0) + payload.quantity;
    if (product.stock < finalQuantity) {
      throw new AppError("Insufficient stock", 409);
    }

    const item = existing
      ? await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: finalQuantity },
        })
      : await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: payload.productId,
            quantity: payload.quantity,
          },
        });

    res.status(201).json({ data: item });
  })
);

router.patch(
  "/items/:itemId",
  asyncHandler(async (req, res) => {
    const payload = updateItemSchema.parse(req.body);

    const item = await prisma.cartItem.findUnique({
      where: { id: req.params.itemId },
      include: { cart: true, product: true },
    });

    if (!item || item.cart.userId !== req.user.id) {
      throw new AppError("Cart item not found", 404);
    }

    if (item.product.stock < payload.quantity) {
      throw new AppError("Insufficient stock", 409);
    }

    const updated = await prisma.cartItem.update({
      where: { id: req.params.itemId },
      data: { quantity: payload.quantity },
    });

    res.json({ data: updated });
  })
);

router.delete(
  "/items/:itemId",
  asyncHandler(async (req, res) => {
    const item = await prisma.cartItem.findUnique({
      where: { id: req.params.itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== req.user.id) {
      throw new AppError("Cart item not found", 404);
    }

    await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    res.status(204).send();
  })
);

module.exports = router;
