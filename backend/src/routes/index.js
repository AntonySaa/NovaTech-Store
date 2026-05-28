const { Router } = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const productRoutes = require("./products.routes");
const cartRoutes = require("./cart.routes");
const orderRoutes = require("./orders.routes");

const router = Router();

router.use("/health", healthRoutes);
router.use("/api/auth", authRoutes);
router.use("/api/products", productRoutes);
router.use("/api/cart", cartRoutes);
router.use("/api/orders", orderRoutes);

module.exports = router;
