const base = process.env.BASE_URL || "http://127.0.0.1:4000";
const rounds = Number(process.env.ROUNDS || 1);

async function req(path, opts = {}) {
  const response = await fetch(`${base}${path}`, {
    method: opts.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`${path} -> ${response.status} ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function runRound(index) {
  console.log(`ROUND_${index}_START`);

  await req("/health");

  const admin = await req("/api/auth/login", {
    method: "POST",
    body: {
      email: "admin@ecommercefinal.com",
      password: "Admin123*",
    },
  });

  const products = await req("/api/products");
  if (!products.data?.length) throw new Error("No products available");

  const email = `user_${Date.now()}_${index}@demo.com`;

  const register = await req("/api/auth/register", {
    method: "POST",
    body: {
      fullName: `Usuario Validacion ${index}`,
      email,
      password: "Password123*",
    },
  });

  await req("/api/cart/items", {
    method: "POST",
    token: register.token,
    body: {
      productId: products.data[0].id,
      quantity: 1,
    },
  });

  const cart = await req("/api/cart", { token: register.token });
  if ((cart.data || []).length < 1) throw new Error("Cart empty after add");

  const checkout = await req("/api/orders/checkout", {
    method: "POST",
    token: register.token,
  });
  if (!checkout.data?.id) throw new Error("Checkout failed");

  const myOrders = await req("/api/orders/my", { token: register.token });
  if ((myOrders.data || []).length < 1) {
    throw new Error("Orders empty after checkout");
  }

  await req("/api/orders", { token: admin.token });

  console.log(`ROUND_${index}_OK`);
}

for (let i = 1; i <= rounds; i++) {
  await runRound(i);
}

console.log("E2E_VALIDATION_OK");
