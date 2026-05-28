const { Router } = require("express");

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "ecommerce-final-backend",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
