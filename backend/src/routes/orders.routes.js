const { Router } = require("express");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const { AppError } = require("../lib/errors");
const { authenticate, authorize } = require("../middlewares/auth");
const { toNumber } = require("../lib/serializers");

const router = Router();
const baseCoupons = {
  GLOBAL5: 5,
  PROMO2026: 8,
  MOBILE7: 7,
  NOVA10: 10,
  NOVA20: 20,
  NOVA2026: 40,
};
const checkoutSchema = z.object({
  deliveryMethod: z.enum(["delivery", "pickup"]).optional().default("delivery"),
  receiptType: z.enum(["boleta", "factura"]).optional().default("boleta"),
  paymentMethod: z
    .enum(["card", "yape", "efectivo", "qr", "store"])
    .optional()
    .default("card"),
  couponCode: z.string().trim().max(30).optional().nullable(),
});

function getFinalPrice(product) {
  const basePrice = toNumber(product.price);
  const discountPercent = Number(product.discountPercent || 0);
  if (discountPercent <= 0) return basePrice;
  return Number((basePrice * (1 - discountPercent / 100)).toFixed(2));
}

function getAvailableCoupons(items) {
  const coupons = { ...baseCoupons };
  for (const item of items) {
    if (!item.product.couponCode) continue;
    const code = item.product.couponCode.trim().toUpperCase();
    const productDiscount = Math.max(5, Number(item.product.discountPercent || 0));
    coupons[code] = Math.max(coupons[code] || 0, productDiscount);
  }
  return coupons;
}

router.use(authenticate);

router.post(
  "/checkout",
  asyncHandler(async (req, res) => {
    const payload = checkoutSchema.parse(req.body || {});
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const items = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: true },
    });

    if (!items.length) {
      throw new AppError("Cart is empty", 400);
    }

    for (const item of items) {
      if (item.product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${item.product.name}`, 409);
      }
    }

    const subtotal = items.reduce(
      (acc, item) => acc + getFinalPrice(item.product) * item.quantity,
      0
    );
    const roundedSubtotal = Number(subtotal.toFixed(2));
    const availableCoupons = getAvailableCoupons(items);
    const couponCode = (payload.couponCode || "").trim().toUpperCase();

    let couponPercent = 0;
    if (couponCode) {
      couponPercent = Number(availableCoupons[couponCode] || 0);
      if (!couponPercent) {
        throw new AppError("Coupon is not valid for this cart", 400);
      }
    }

    const couponDiscount = Number(
      (roundedSubtotal * (couponPercent / 100)).toFixed(2)
    );
    const shippingCost =
      payload.deliveryMethod === "pickup" || roundedSubtotal >= 199 ? 0 : 12;
    const total = Number(
      (roundedSubtotal - couponDiscount + shippingCost).toFixed(2)
    );

    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      const createdOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          status: "PAID",
          total,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: getFinalPrice(item.product),
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return createdOrder;
    });

    const serialized = {
      ...order,
      total: toNumber(order.total),
      checkout: {
        deliveryMethod: payload.deliveryMethod,
        receiptType: payload.receiptType,
        paymentMethod: payload.paymentMethod,
        couponCode: couponCode || null,
        couponPercent,
        couponDiscount,
        shippingCost,
        subtotal: roundedSubtotal,
      },
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: toNumber(item.unitPrice),
        productName: item.product.name,
      })),
    };

    res.status(201).json({ data: serialized });
  })
);

router.get(
  "/my",
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = orders.map((order) => ({
      id: order.id,
      status: order.status,
      total: toNumber(order.total),
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: toNumber(item.unitPrice),
      })),
    }));

    res.json({ data });
  })
);

router.get(
  "/",
  authorize("ADMIN"),
  asyncHandler(async (_req, res) => {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      data: orders.map((order) => ({
        ...order,
        total: toNumber(order.total),
      })),
    });
  })
);

module.exports = router;
