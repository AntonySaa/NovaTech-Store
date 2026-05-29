import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const CATEGORY_OPTIONS = [
  "COMPUTO",
  "PERIFERICOS",
  "GAMING",
  "AUDIO",
  "MOVIL",
];
const CATEGORY_LABELS = {
  COMPUTO: "Computo",
  PERIFERICOS: "Perifericos",
  GAMING: "Gaming",
  AUDIO: "Audio",
  MOVIL: "Movil",
};
const TOP_MENU_ITEMS = [
  { key: "productos", label: "Productos" },
  { key: "marcas", label: "Marcas" },
  { key: "novedades", label: "Novedades" },
  { key: "ofertas", label: "Ofertas" },
  { key: "laptops", label: "Laptops" },
  { key: "pcsMarca", label: "PCs de Marca" },
  { key: "pcsRino", label: "PCs MK Rino" },
  { key: "pos", label: "Punto de Venta POS" },
  { key: "monitores", label: "Monitores" },
  { key: "promociones", label: "Promociones" },
];
const MEGA_MENU_CONTENT = {
  productos: [
    [
      "Accesorios",
      "Adaptadores",
      "Auriculares y Microfonos",
      "Cables y Conectores",
      "Impresoras y Scanners",
      "Tablets y Celulares",
    ],
    [
      "Memorias USB y SSD",
      "Mochilas para Laptops",
      "Monitores y Pantallas",
      "Mouse y Teclados",
      "Parlantes",
      "Procesadores",
    ],
    [
      "Software y Antivirus",
      "Tintas y Toner",
      "Tarjetas Graficas",
      "UPS y Regletas",
      "Zona Empresarial",
      "Zona Gaming",
    ],
  ],
  marcas: [
    ["Lenovo", "HP", "Dell", "ASUS", "Acer", "MSI"],
    ["Logitech", "Razer", "HyperX", "Redragon", "TP-Link", "Ubiquiti"],
    ["AMD", "Intel", "NVIDIA", "Kingston", "Samsung", "WD"],
  ],
  novedades: [
    ["Nuevos Laptops 2026", "Nuevos Monitores 2K/4K", "PC Armadas nuevas"],
    ["Nuevos Teclados Mecanicos", "Nuevos Audifonos BT", "Nuevas Tablets"],
    ["Nuevos SSD NVMe", "Nuevos Routers WiFi 7", "Nuevos Kits Streaming"],
  ],
  ofertas: [
    ["Ofertas Flash del dia", "Combos Laptop + Mochila", "Packs Home Office"],
    ["Descuentos en perifericos", "Cupones por categoria", "Outlet tecnico"],
    ["Promos semanales", "Liquidacion selecta", "Envio gratis en seleccion"],
  ],
  laptops: [
    ["Laptops para Estudio", "Laptops para Oficina", "Laptops Gamer"],
    ["Laptops Core i5/i7", "Laptops Ryzen", "Laptops con RTX"],
    ["Laptops Ultrabook", "Laptops 2 en 1", "Laptops Empresariales"],
  ],
  pcsMarca: [
    ["HP ProDesk", "Lenovo ThinkCentre", "Dell OptiPlex"],
    ["ASUS ExpertCenter", "Acer Veriton", "MSI Business"],
    ["Workstations", "Mini PCs", "All-in-One"],
  ],
  pcsRino: [
    ["PC MK Rino Entry", "PC MK Rino Creator", "PC MK Rino Gamer"],
    ["MK Rino Streaming", "MK Rino Pro", "MK Rino Ultra"],
    ["Configuracion Personalizada", "Upgrade de componentes", "Soporte Tecnico"],
  ],
  pos: [
    ["Impresoras POS", "Lectores de codigo", "Cajones de dinero"],
    ["Pantallas touch POS", "Balanzas POS", "Rollos termicos"],
    ["Software POS", "Licencias", "Accesorios POS"],
  ],
  monitores: [
    ["Monitores Full HD", "Monitores 2K", "Monitores 4K"],
    ["Monitores Gamer 144Hz+", "Monitores Curvos", "Monitores IPS"],
    ["Brazos y soportes", "Cables de video", "Calibracion de color"],
  ],
  promociones: [
    ["Cupon NOVA10", "Cupon TEC20", "Cyber semana"],
    ["Promo estudiantes", "Promo empresas", "Combo periféricos"],
    ["Black Friday", "Back to school", "Mes gamer"],
  ],
};
const PRODUCT_SECTION_CONFIG = [
  { key: "laptop", label: "Laptop", keywords: ["laptop", "notebook"] },
  { key: "monitores", label: "Monitores", keywords: ["monitor", "pantalla"] },
  { key: "mouse", label: "Mouse", keywords: ["mouse", "raton"] },
  { key: "teclado", label: "Teclado", keywords: ["teclado", "keyboard"] },
  { key: "tablet", label: "Tablet", keywords: ["tablet", "tab"] },
  {
    key: "celulares",
    label: "Celulares",
    keywords: ["celular", "smartphone", "movil", "phone"],
  },
];
const SECTION_ICON = {
  laptop: "💻",
  monitores: "🖥️",
  mouse: "🖱️",
  teclado: "⌨️",
  tablet: "📱",
  celulares: "📲",
};
const FINANCE_PROMOS = [
  {
    title: "6 y 12 MESES SIN INTERESES",
    subtitle: "Con tarjetas BBVA, BCP, Interbank y Scotia",
    banks: ["BBVA", "BCP", "Interbank", "Scotia"],
  },
  {
    title: "Hasta 36 MESES SIN INTERESES",
    subtitle: "Con tarjeta Diners en marcas seleccionadas",
    banks: ["Diners Club"],
  },
  {
    title: "6 y 12 MESES SIN INTERESES",
    subtitle: "Con tarjeta Cencosud en productos participantes",
    banks: ["Cencosud"],
  },
];
const FEATURED_PAIR_BANNERS = [
  {
    key: "featured-a",
    items: [
      { image: "/featured/featured-01.png" },
      { image: "/featured/featured-03.png" },
    ],
  },
  {
    key: "featured-b",
    items: [
      { image: "/featured/featured-04.png" },
      { image: "/featured/featured-05.png" },
    ],
  },
  {
    key: "featured-c",
    items: [
      { image: "/featured/featured-06.png" },
      { image: "/featured/featured-07.png" },
    ],
  },
];
const BANK_META = {
  BBVA: { logo: "/banks/bbva.svg", alt: "Logo BBVA", className: "bbva" },
  BCP: { logo: "/banks/bcp.svg", alt: "Logo BCP", className: "bcp" },
  Interbank: {
    logo: "/banks/interbank.svg",
    alt: "Logo Interbank",
    className: "interbank",
  },
  Scotia: {
    logo: "/banks/scotiabank.svg",
    alt: "Logo Scotiabank",
    className: "scotia",
  },
  "Diners Club": {
    logo: "/banks/diners.svg",
    alt: "Logo Diners Club",
    className: "diners",
  },
  Cencosud: {
    logo: "/banks/cencosud.svg",
    alt: "Logo Cencosud",
    className: "cencosud",
  },
};

const emptyRegister = { fullName: "", email: "", password: "" };
const emptyLogin = { email: "", password: "" };
const emptyProduct = {
  name: "",
  description: "",
  category: "COMPUTO",
  price: "",
  discountPercent: "0",
  couponCode: "",
  stock: "",
  imageUrl: "",
};
const emptyCheckoutForm = {
  firstName: "",
  lastName: "",
  documentType: "DNI",
  documentNumber: "",
  department: "Lima",
  province: "Lima",
  district: "",
  address: "",
  reference: "",
  phone: "",
};
const BASE_COUPONS = {
  GLOBAL5: 5,
  PROMO2026: 8,
  MOBILE7: 7,
  NOVA10: 10,
  NOVA20: 20,
  NOVA2026: 40,
};

const PRODUCT_IMAGE_LIBRARY = {
  laptop: [
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=1400&auto=format&fit=crop",
  ],
  monitor: [
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1527814050087-3793815479db?w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1400&auto=format&fit=crop",
  ],
  mouse: [
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1629429407756-01cd3d7cfb38?w=1400&auto=format&fit=crop",
  ],
  teclado: [
    "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1630975797856-7f4dcf5b4d5f?w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1400&auto=format&fit=crop",
  ],
  tablet: [
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=1400&auto=format&fit=crop",
  ],
  celular: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1400&auto=format&fit=crop",
  ],
  audio: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=1400&auto=format&fit=crop",
  ],
  webcam: [
    "https://images.unsplash.com/photo-1623949556303-b0d17d198863?w=1400&auto=format&fit=crop",
  ],
  generic: [
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1400&auto=format&fit=crop",
  ],
};

function hashText(value) {
  return String(value || "")
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function pickFromLibrary(bucket, identity) {
  const images = PRODUCT_IMAGE_LIBRARY[bucket] || PRODUCT_IMAGE_LIBRARY.generic;
  return images[hashText(identity) % images.length];
}

function resolveProductImage(product, sectionKey = "") {
  const name = String(product?.name || "").toLowerCase();
  const category = String(product?.category || "").toLowerCase();
  const identity = product?.slug || product?.id || name;

  if (name.includes("monitor") || sectionKey === "monitores") {
    return pickFromLibrary("monitor", identity);
  }
  if (name.includes("mouse") || sectionKey === "mouse") {
    return pickFromLibrary("mouse", identity);
  }
  if (name.includes("teclado") || name.includes("keyboard") || sectionKey === "teclado") {
    return pickFromLibrary("teclado", identity);
  }
  if (name.includes("tablet") || name.includes("tab ") || sectionKey === "tablet") {
    return pickFromLibrary("tablet", identity);
  }
  if (
    name.includes("iphone") ||
    name.includes("samsung galaxy") ||
    name.includes("motorola") ||
    name.includes("xiaomi") ||
    name.includes("celular") ||
    name.includes("smartphone") ||
    sectionKey === "celulares"
  ) {
    return pickFromLibrary("celular", identity);
  }
  if (name.includes("audifono") || name.includes("parlante") || category.includes("audio")) {
    return pickFromLibrary("audio", identity);
  }
  if (name.includes("webcam")) {
    return pickFromLibrary("webcam", identity);
  }
  if (name.includes("laptop") || name.includes("notebook") || sectionKey === "laptop") {
    return pickFromLibrary("laptop", identity);
  }
  if (category.includes("movil")) {
    return pickFromLibrary("celular", identity);
  }
  if (category.includes("perifericos")) {
    return pickFromLibrary("mouse", identity);
  }
  if (category.includes("gaming") || category.includes("computo")) {
    return pickFromLibrary("laptop", identity);
  }

  return (
    (product?.imageUrl && String(product.imageUrl).trim()) ||
    pickFromLibrary("generic", identity)
  );
}

function App() {
  const googleButtonRef = useRef(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [mode, setMode] = useState("login");
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [loginForm, setLoginForm] = useState(emptyLogin);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ data: [], total: 0 });
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleScriptReady, setGoogleScriptReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [checkoutForm, setCheckoutForm] = useState(emptyCheckoutForm);
  const [receiptType, setReceiptType] = useState("boleta");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponStatus, setCouponStatus] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [featuredPairPage, setFeaturedPairPage] = useState(0);
  const [activeView, setActiveView] = useState("store");

  const isAdmin = user?.role === "ADMIN";
  const hasGoogleClientId = Boolean(GOOGLE_CLIENT_ID);

  const authHeaders = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      if (!normalizedSearch) return true;
      return (
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [products, searchTerm]);

  const promoMessages = useMemo(() => {
    const fixedCouponPromos = [
      "Cupon NOVA10: 10% OFF en productos seleccionados",
      "Cupon NOVA20: 20% OFF en productos participantes",
      "Cupon NOVA2026: 40% OFF en promociones especiales",
    ];

    const dynamicPromos = products
      .filter(
        (product) =>
          Number(product.discountPercent || 0) > 0 || Boolean(product.couponCode)
      )
      .map((product) => {
        const discount = Number(product.discountPercent || 0);
        const base =
          discount > 0
            ? `${product.name}: ${discount}% OFF`
            : `${product.name}: promocion especial`;

        return product.couponCode
          ? `${base} con cupon ${product.couponCode}`
          : base;
      });

    const fallbackPromos = [
      "Cupon GLOBAL5 disponible en compras mayores a S/ 250",
      "Envio gratis en Lima por compras desde S/ 199",
      "Descuento gamer de fin de semana en productos seleccionados",
    ];

    return dynamicPromos.length > 0
      ? [...fixedCouponPromos, ...dynamicPromos, ...fallbackPromos]
      : [...fixedCouponPromos, ...fallbackPromos];
  }, [products]);

  const cartItemCount = useMemo(() => {
    return (cart.data || []).reduce((sum, item) => sum + item.quantity, 0);
  }, [cart.data]);

  const cartSubtotal = useMemo(() => Number(cart.total || 0), [cart.total]);

  const availableCoupons = useMemo(() => {
    const dynamic = (cart.data || []).reduce((acc, item) => {
      const code = item.product?.couponCode;
      if (!code) return acc;
      const normalized = code.toUpperCase().trim();
      const discount = Math.max(5, Number(item.product?.discountPercent || 0));
      return {
        ...acc,
        [normalized]: discount,
      };
    }, {});
    return {
      ...BASE_COUPONS,
      ...dynamic,
    };
  }, [cart.data]);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return Number((cartSubtotal * (appliedCoupon.percent / 100)).toFixed(2));
  }, [appliedCoupon, cartSubtotal]);

  const shippingCost = useMemo(() => {
    if (deliveryMethod === "pickup") return 0;
    if (cartSubtotal >= 199) return 0;
    return 12;
  }, [cartSubtotal, deliveryMethod]);

  const checkoutTotal = useMemo(() => {
    return Number((cartSubtotal - couponDiscount + shippingCost).toFixed(2));
  }, [cartSubtotal, couponDiscount, shippingCost]);

  const featuredPairPages = useMemo(() => {
    return FEATURED_PAIR_BANNERS;
  }, []);

  useEffect(() => {
    if (featuredPairPages.length <= 1) return;
    const intervalId = setInterval(() => {
      setFeaturedPairPage((prev) => (prev + 1) % featuredPairPages.length);
    }, 3200);
    return () => clearInterval(intervalId);
  }, [featuredPairPages]);

  const productSections = useMemo(() => {
    return PRODUCT_SECTION_CONFIG.map((section) => {
      const sectionProducts = filteredProducts.filter((product) => {
        const text =
          `${product.name} ${product.description} ${product.category}`.toLowerCase();
        return section.keywords.some((keyword) => text.includes(keyword));
      });

      const fallback =
        sectionProducts.length > 0
          ? sectionProducts
          : filteredProducts.slice(0, Math.min(6, filteredProducts.length));

      return {
        key: section.key,
        label: section.label,
        products: fallback,
      };
    });
  }, [filteredProducts]);

  const api = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (response.status === 204) return null;

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || "Request failed");
    }

    return payload;
  }, [authHeaders]);

  const loadProducts = useCallback(async () => {
    const response = await api("/api/products");
    setProducts(response.data || []);
  }, [api]);

  const loadCart = useCallback(async () => {
    if (!token) return;
    const response = await api("/api/cart");
    setCart(response);
  }, [api, token]);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    const response = await api("/api/orders/my");
    setOrders(response.data || []);
  }, [api, token]);

  useEffect(() => {
    loadProducts().catch((error) => setMessage(error.message));
  }, [loadProducts]);

  useEffect(() => {
    if (!token) return;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    Promise.all([loadCart(), loadOrders()]).catch((error) =>
      setMessage(error.message)
    );
  }, [token, user, loadCart, loadOrders]);

  useEffect(() => {
    if (!user) return;
    setCheckoutForm((prev) => {
      if (prev.firstName || prev.lastName || prev.phone || prev.documentNumber) {
        return prev;
      }
      const [firstName = "", ...rest] = (user.fullName || "").split(" ");
      return {
        ...prev,
        firstName,
        lastName: rest.join(" "),
      };
    });
  }, [user]);

  useEffect(() => {
    if (!appliedCoupon) return;
    const nextPercent = availableCoupons[appliedCoupon.code];
    if (!nextPercent) {
      setAppliedCoupon(null);
      setCouponStatus("El cupon aplicado ya no esta disponible.");
      return;
    }
    if (nextPercent !== appliedCoupon.percent) {
      setAppliedCoupon({ code: appliedCoupon.code, percent: nextPercent });
    }
  }, [appliedCoupon, availableCoupons]);

  const loginWithGoogle = useCallback(
    async (idToken) => {
      setLoading(true);
      setMessage("");
      try {
        const response = await api("/api/auth/google", {
          method: "POST",
          body: { idToken },
        });
        setToken(response.token);
        setUser(response.user);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  useEffect(() => {
    if (!hasGoogleClientId) return;

    if (window.google?.accounts?.id) {
      setGoogleScriptReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleScriptReady(true);
    script.onerror = () =>
      setMessage("No se pudo cargar Google Sign-In en este momento.");
    document.head.appendChild(script);
  }, [hasGoogleClientId]);

  useEffect(() => {
    if (!hasGoogleClientId || !googleScriptReady || !googleButtonRef.current) {
      return;
    }

    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        if (response.credential) {
          void loginWithGoogle(response.credential);
        }
      },
    });

    googleButtonRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: 280,
    });
  }, [authModalOpen, googleScriptReady, hasGoogleClientId, loginWithGoogle]);

  async function submitRegister(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await api("/api/auth/register", {
        method: "POST",
        body: registerForm,
      });
      setToken(response.token);
      setUser(response.user);
      setRegisterForm(emptyRegister);
      setAuthModalOpen(false);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitLogin(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await api("/api/auth/login", {
        method: "POST",
        body: loginForm,
      });
      setToken(response.token);
      setUser(response.user);
      setLoginForm(emptyLogin);
      setAuthModalOpen(false);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken("");
    setUser(null);
    setAccountMenuOpen(false);
    setCheckoutOpen(false);
    setActiveView("store");
    setCart({ data: [], total: 0 });
    setOrders([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  async function addToCart(productId) {
    setMessage("");
    try {
      await api("/api/cart/items", {
        method: "POST",
        body: { productId, quantity: 1 },
      });
      await loadCart();
      setMessage("Producto agregado al carrito.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function updateItem(itemId, quantity) {
    if (quantity < 1) return;
    setMessage("");
    try {
      await api(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        body: { quantity },
      });
      await loadCart();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function removeItem(itemId) {
    setMessage("");
    try {
      await api(`/api/cart/items/${itemId}`, { method: "DELETE" });
      await loadCart();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function createProduct(event) {
    event.preventDefault();
    setMessage("");
    try {
      await api("/api/products", {
        method: "POST",
        body: {
          name: productForm.name,
          description: productForm.description,
          category: productForm.category,
          price: Number(productForm.price),
          discountPercent: Number(productForm.discountPercent || 0),
          couponCode: productForm.couponCode || null,
          stock: Number(productForm.stock),
          imageUrl: productForm.imageUrl || null,
          isActive: true,
        },
      });
      setProductForm(emptyProduct);
      await loadProducts();
      setMessage("Producto creado.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  function openCheckoutFlow() {
    if (!user) {
      setMode("login");
      setAuthModalOpen(true);
      return;
    }
    if (cart.data.length === 0) {
      setMessage("Tu carrito esta vacio.");
      return;
    }
    setAccountMenuOpen(false);
    setActiveView("store");
    setCheckoutOpen(true);
    setCheckoutStep(1);
    setCouponInput("");
    setAppliedCoupon(null);
    setCouponStatus("");
  }

  function openOrdersView() {
    if (!user) {
      setMode("login");
      setAuthModalOpen(true);
      return;
    }
    setAccountMenuOpen(false);
    setCheckoutOpen(false);
    setActiveView("orders");
  }

  function closeCheckoutFlow() {
    setCheckoutOpen(false);
    setCheckoutStep(1);
    setCouponInput("");
    setAppliedCoupon(null);
    setCouponStatus("");
  }

  function applyCoupon() {
    const normalized = couponInput.trim().toUpperCase();
    if (!normalized) {
      setCouponStatus("Ingresa un cupon.");
      return;
    }
    const discount = availableCoupons[normalized];
    if (!discount) {
      setAppliedCoupon(null);
      setCouponStatus("Cupon no valido.");
      return;
    }
    setAppliedCoupon({ code: normalized, percent: discount });
    setCouponStatus(`Cupon ${normalized} aplicado: ${discount}% OFF.`);
  }

  async function confirmCheckout() {
    try {
      await api("/api/orders/checkout", {
        method: "POST",
        body: {
          deliveryMethod,
          receiptType,
          paymentMethod,
          couponCode: appliedCoupon?.code || null,
        },
      });
      await Promise.all([loadCart(), loadOrders(), loadProducts()]);
      setCheckoutOpen(false);
      setCheckoutStep(1);
      setCouponInput("");
      setAppliedCoupon(null);
      setCouponStatus("");
      setMessage("Pago realizado correctamente. Tu pedido fue registrado.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  function goToPaymentStep() {
    const baseRequired = [
      checkoutForm.firstName,
      checkoutForm.lastName,
      checkoutForm.documentNumber,
      checkoutForm.phone,
    ];
    const addressRequired =
      deliveryMethod === "delivery"
        ? [
            checkoutForm.department,
            checkoutForm.province,
            checkoutForm.district,
            checkoutForm.address,
          ]
        : [];
    const hasMissingField = [...baseRequired, ...addressRequired].some(
      (value) => !String(value || "").trim()
    );
    if (hasMissingField) {
      setMessage("Completa los campos obligatorios para continuar al pago.");
      return;
    }
    setMessage("");
    setCheckoutStep(3);
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="heroMain">
          <div className="heroBrand">
            <h1>NovaTech Store</h1>
            <p className="heroTagline">Computo Mayorista</p>
          </div>
          <div className="heroSearchSlot">
            <input
              className="mkSearch heroSearch"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="heroActionsSlot">
            <div className="mkTopActions">
              <button
                className="mkAccountTrigger"
                type="button"
                onClick={() => {
                  if (user) {
                    setAccountMenuOpen((prev) => !prev);
                    return;
                  }
                  setMode("login");
                  setAuthModalOpen(true);
                }}
              >
                <span className="mkUserIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                    <path
                      d="M12 12.75a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 1.5c-4.14 0-7.5 2.69-7.5 6v.75h15v-.75c0-3.31-3.36-6-7.5-6Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <div>
                  <small>BIENVENIDO</small>
                  <strong>{user ? user.fullName : "Iniciar Sesion"}</strong>
                </div>
              </button>
              <button
                className="mkCartTrigger"
                type="button"
                onClick={openCheckoutFlow}
              >
                <span className="mkCartIcon" aria-hidden="true">
                  🛒
                </span>
                <span>{cartItemCount}</span>
              </button>
            </div>
            {user && accountMenuOpen && (
              <div className="accountQuickMenu">
                <button type="button" className="ghost" onClick={openOrdersView}>
                  Historial de compras
                </button>
                <button type="button" className="ghost" onClick={logout}>
                  Cerrar sesion
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section
        className="mkMenuArea"
        onMouseLeave={() => setActiveMegaMenu(null)}
      >
        <div className="mkTopStrip" aria-label="Menu principal tienda">
          <div className="mkTopMenu">
            {TOP_MENU_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={activeMegaMenu === item.key ? "menuActive" : ""}
                onMouseEnter={() => setActiveMegaMenu(item.key)}
                onFocus={() => setActiveMegaMenu(item.key)}
              >
                {item.key === "productos" && (
                  <span className="menuHamburger" aria-hidden="true">
                    ☰
                  </span>
                )}
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {activeMegaMenu && (
          <section className="mkMegaMenu" aria-label="Menu desplegable">
            {(MEGA_MENU_CONTENT[activeMegaMenu] || []).map((column, index) => (
              <ul key={`${activeMegaMenu}-col-${index}`}>
                {column.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            ))}
          </section>
        )}
      </section>

      {authModalOpen && !user && (
        <div
          className="authModalBackdrop"
          role="presentation"
          onClick={() => setAuthModalOpen(false)}
        >
          <section
            className="authModalCard"
            role="dialog"
            aria-modal="true"
            aria-label="Opciones de inicio de sesion"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="authModalClose"
              type="button"
              onClick={() => setAuthModalOpen(false)}
            >
              ×
            </button>
            <div className="authChoiceButtons">
              <button type="button" onClick={() => setMode("login")}>
                Ingresar cuenta
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => setMode("register")}
              >
                Crear cuenta
              </button>
            </div>
            {mode === "login" ? (
              <form onSubmit={submitLogin} className="modalForm">
                <input
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm({ ...loginForm, email: event.target.value })
                  }
                  placeholder="Correo"
                  type="email"
                  required
                />
                <input
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm({ ...loginForm, password: event.target.value })
                  }
                  placeholder="Contrasena"
                  type="password"
                  required
                />
                <button disabled={loading}>Entrar</button>
              </form>
            ) : (
              <form onSubmit={submitRegister} className="modalForm">
                <input
                  value={registerForm.fullName}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
                      fullName: event.target.value,
                    })
                  }
                  placeholder="Nombre completo"
                  required
                />
                <input
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, email: event.target.value })
                  }
                  placeholder="Correo"
                  type="email"
                  required
                />
                <input
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
                      password: event.target.value,
                    })
                  }
                  placeholder="Contrasena"
                  type="password"
                  required
                />
                <button disabled={loading}>Crear cuenta</button>
              </form>
            )}
            <div className="googleLogin modalGoogle">
              <span>o continua con Google</span>
              {hasGoogleClientId ? (
                <div className="googleButtonWrap" ref={googleButtonRef} />
              ) : (
                <small>Login con Google no disponible temporalmente.</small>
              )}
            </div>
          </section>
        </div>
      )}

      {message && <div className="message">{message}</div>}

      {checkoutOpen ? (
        <section className="checkoutFlow">
          <header className="checkoutHead">
            <h2>
              {checkoutStep === 1 && "Carrito de compras"}
              {checkoutStep === 2 && "Metodo de entrega"}
              {checkoutStep === 3 && "Pago"}
            </h2>
            <div className="checkoutSteps">
              <span className={checkoutStep >= 1 ? "active" : ""}>Carrito</span>
              <span className={checkoutStep >= 2 ? "active" : ""}>Entrega</span>
              <span className={checkoutStep >= 3 ? "active" : ""}>Pago</span>
            </div>
            <button type="button" className="ghost" onClick={closeCheckoutFlow}>
              Volver a tienda
            </button>
          </header>

          {checkoutStep === 1 && (
            <div className="checkoutGrid">
              <section className="checkoutMain panel">
                {(cart.data || []).map((item) => (
                  <article key={item.id} className="checkoutItem">
                    <img
                      src={resolveProductImage(item.product)}
                      alt={item.product.name}
                    />
                    <div className="checkoutItemInfo">
                      <strong>{item.product.name}</strong>
                      <small>S/ {Number(item.product.finalPrice || item.product.price).toFixed(2)}</small>
                      <div className="actions">
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                        <button type="button" className="ghost" onClick={() => removeItem(item.id)}>
                          Quitar
                        </button>
                      </div>
                    </div>
                    <p className="checkoutPrice">S/ {item.subtotal.toFixed(2)}</p>
                  </article>
                ))}
                <button
                  type="button"
                  disabled={!cart.data.length}
                  onClick={() => setCheckoutStep(2)}
                >
                  Siguiente
                </button>
              </section>
              <aside className="checkoutSide panel">
                <h3>Resumen de pedido</h3>
                <p>{cartItemCount} producto(s)</p>
                <div className="checkoutLine">
                  <span>Subtotal</span>
                  <strong>S/ {cartSubtotal.toFixed(2)}</strong>
                </div>
                <div className="checkoutLine">
                  <span>Total</span>
                  <strong>S/ {cartSubtotal.toFixed(2)}</strong>
                </div>
              </aside>
            </div>
          )}

          {checkoutStep === 2 && (
            <div className="checkoutGrid">
              <section className="checkoutMain panel">
                <h3>Elige tu metodo de entrega</h3>
                <div className="deliveryMethods">
                  <button
                    type="button"
                    className={deliveryMethod === "delivery" ? "methodActive" : "ghost"}
                    onClick={() => setDeliveryMethod("delivery")}
                  >
                    Envio a domicilio
                  </button>
                  <button
                    type="button"
                    className={deliveryMethod === "pickup" ? "methodActive" : "ghost"}
                    onClick={() => setDeliveryMethod("pickup")}
                  >
                    Retiro en tienda
                  </button>
                </div>
                <h3>Mi direccion</h3>
                <div className="checkoutFormGrid">
                  <input
                    placeholder="Nombre"
                    value={checkoutForm.firstName}
                    onChange={(event) =>
                      setCheckoutForm({ ...checkoutForm, firstName: event.target.value })
                    }
                  />
                  <input
                    placeholder="Apellidos"
                    value={checkoutForm.lastName}
                    onChange={(event) =>
                      setCheckoutForm({ ...checkoutForm, lastName: event.target.value })
                    }
                  />
                  <select
                    value={checkoutForm.documentType}
                    onChange={(event) =>
                      setCheckoutForm({ ...checkoutForm, documentType: event.target.value })
                    }
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">CE</option>
                    <option value="RUC">RUC</option>
                  </select>
                  <input
                    placeholder="Numero de documento"
                    value={checkoutForm.documentNumber}
                    onChange={(event) =>
                      setCheckoutForm({ ...checkoutForm, documentNumber: event.target.value })
                    }
                  />
                  <input
                    placeholder="Departamento"
                    value={checkoutForm.department}
                    onChange={(event) =>
                      setCheckoutForm({ ...checkoutForm, department: event.target.value })
                    }
                  />
                  <input
                    placeholder="Provincia"
                    value={checkoutForm.province}
                    onChange={(event) =>
                      setCheckoutForm({ ...checkoutForm, province: event.target.value })
                    }
                  />
                  <input
                    placeholder="Distrito"
                    value={checkoutForm.district}
                    onChange={(event) =>
                      setCheckoutForm({ ...checkoutForm, district: event.target.value })
                    }
                  />
                  <input
                    placeholder="Direccion"
                    value={checkoutForm.address}
                    onChange={(event) =>
                      setCheckoutForm({ ...checkoutForm, address: event.target.value })
                    }
                  />
                  <input
                    placeholder="Referencia"
                    value={checkoutForm.reference}
                    onChange={(event) =>
                      setCheckoutForm({ ...checkoutForm, reference: event.target.value })
                    }
                  />
                  <input
                    placeholder="Celular"
                    value={checkoutForm.phone}
                    onChange={(event) =>
                      setCheckoutForm({ ...checkoutForm, phone: event.target.value })
                    }
                  />
                </div>
                <div className="checkoutActions">
                  <button type="button" className="ghost" onClick={() => setCheckoutStep(1)}>
                    Volver
                  </button>
                  <button type="button" onClick={goToPaymentStep}>
                    Confirmar entrega
                  </button>
                </div>
              </section>
              <aside className="checkoutSide panel">
                <h3>Resumen de pedido</h3>
                <div className="checkoutLine">
                  <span>Subtotal</span>
                  <strong>S/ {cartSubtotal.toFixed(2)}</strong>
                </div>
                <div className="checkoutLine">
                  <span>Costo envio</span>
                  <strong>{shippingCost === 0 ? "Gratis" : `S/ ${shippingCost.toFixed(2)}`}</strong>
                </div>
                <div className="checkoutLine">
                  <span>Total</span>
                  <strong>S/ {checkoutTotal.toFixed(2)}</strong>
                </div>
              </aside>
            </div>
          )}

          {checkoutStep === 3 && (
            <div className="checkoutGrid">
              <section className="checkoutMain panel">
                <h3>Comprobante de pago</h3>
                <div className="deliveryMethods">
                  <button
                    type="button"
                    className={receiptType === "boleta" ? "methodActive" : "ghost"}
                    onClick={() => setReceiptType("boleta")}
                  >
                    Boleta
                  </button>
                  <button
                    type="button"
                    className={receiptType === "factura" ? "methodActive" : "ghost"}
                    onClick={() => setReceiptType("factura")}
                  >
                    Factura
                  </button>
                </div>
                <h3>Medio de pago</h3>
                <div className="deliveryMethods payGrid">
                  <button
                    type="button"
                    className={paymentMethod === "card" ? "methodActive" : "ghost"}
                    onClick={() => setPaymentMethod("card")}
                  >
                    Tarjeta
                  </button>
                  <button
                    type="button"
                    className={paymentMethod === "yape" ? "methodActive" : "ghost"}
                    onClick={() => setPaymentMethod("yape")}
                  >
                    Yape
                  </button>
                  <button
                    type="button"
                    className={paymentMethod === "efectivo" ? "methodActive" : "ghost"}
                    onClick={() => setPaymentMethod("efectivo")}
                  >
                    PagoEfectivo
                  </button>
                  <button
                    type="button"
                    className={paymentMethod === "qr" ? "methodActive" : "ghost"}
                    onClick={() => setPaymentMethod("qr")}
                  >
                    QR
                  </button>
                </div>
                <div className="checkoutActions">
                  <button type="button" className="ghost" onClick={() => setCheckoutStep(2)}>
                    Volver
                  </button>
                  <button type="button" onClick={confirmCheckout}>
                    Pagar ahora
                  </button>
                </div>
              </section>
              <aside className="checkoutSide panel">
                <h3>Resumen de pedido</h3>
                <div className="couponApply">
                  <input
                    placeholder="Cupon de descuento"
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value)}
                  />
                  <button type="button" onClick={applyCoupon}>
                    Aplicar
                  </button>
                </div>
                {couponStatus && <p className="couponStatus">{couponStatus}</p>}
                <div className="checkoutLine">
                  <span>Subtotal</span>
                  <strong>S/ {cartSubtotal.toFixed(2)}</strong>
                </div>
                <div className="checkoutLine">
                  <span>Descuento</span>
                  <strong>- S/ {couponDiscount.toFixed(2)}</strong>
                </div>
                <div className="checkoutLine">
                  <span>Costo envio</span>
                  <strong>{shippingCost === 0 ? "Gratis" : `S/ ${shippingCost.toFixed(2)}`}</strong>
                </div>
                <div className="checkoutLine">
                  <span>Total pedido</span>
                  <strong>S/ {checkoutTotal.toFixed(2)}</strong>
                </div>
              </aside>
            </div>
          )}
        </section>
      ) : activeView === "orders" ? (
        <section className="panel orders ordersPage">
          <div className="ordersPageHead">
            <h2>Historial de compras</h2>
            <button type="button" onClick={() => setActiveView("store")}>
              Volver a tienda
            </button>
          </div>
          {orders.length === 0 && <p>Aun no tienes compras registradas.</p>}
          {orders.map((order) => (
            <article className="order" key={order.id}>
              <header>
                <strong>Orden {order.id.slice(-8)}</strong>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </header>
              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.productName} x{item.quantity} - S/{" "}
                    {Number(item.unitPrice).toFixed(2)}
                  </li>
                ))}
              </ul>
              <footer>
                <strong>Total: S/ {Number(order.total).toFixed(2)}</strong>
              </footer>
            </article>
          ))}
        </section>
      ) : (
        <section className="mkLayout">
          <main className="mkMain">
            <section className="panel mkModels">
              <div className="mkFeaturedPairsWrap">
                <div className="mkFeaturedPairsGrid">
                  {featuredPairPages[featuredPairPage] && (
                    <article
                      className="featuredPairBanner"
                      key={featuredPairPages[featuredPairPage].key}
                    >
                      {featuredPairPages[featuredPairPage].items.map((item, index) => (
                        <div
                          className="featuredPairItem"
                          key={`${featuredPairPages[featuredPairPage].key}-${index}`}
                        >
                          <img
                            src={item.image}
                            alt={`featured-${featuredPairPages[featuredPairPage].key}-${index + 1}`}
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </article>
                  )}
                </div>
              </div>
            </section>

            <section className="panel financePromoSection">
              <div className="financePromoGrid">
                {FINANCE_PROMOS.map((promo) => (
                  <article key={promo.title} className="financeCard">
                    <strong>{promo.title}</strong>
                    <p>{promo.subtitle}</p>
                    <div className="bankBadges">
                      {promo.banks.map((bank) => (
                        <span
                          key={`${promo.title}-${bank}`}
                          className={`bankLogo ${BANK_META[bank]?.className || ""}`}
                          title={bank}
                          aria-label={bank}
                        >
                          <img
                            src={BANK_META[bank]?.logo}
                            alt={BANK_META[bank]?.alt || bank}
                            loading="lazy"
                          />
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel catalog">
              {productSections.map((section) => (
                <section key={section.key} className="categorySection categoryMarquee">
                  <div className="categoryHeaderRow">
                    <h3 className="categoryTitle">
                      <span className="categoryIcon" aria-hidden="true">
                        {SECTION_ICON[section.key] || "•"}
                      </span>
                      {section.label}
                    </h3>
                  </div>
                  <div className="sectionStaticGrid">
                    {section.products.slice(0, 4).map((product) => {
                      const discount = Number(product.discountPercent || 0);
                      const finalPrice = Number(
                        product.finalPrice ||
                          Number(product.price) * (1 - discount / 100)
                      );

                      return (
                        <article className="product sectionCard" key={`${section.key}-${product.id}`}>
                          {discount > 0 && (
                            <span className="discountCorner">-{discount}%</span>
                          )}
                          <img
                            src={resolveProductImage(product, section.key)}
                            alt={product.name}
                          />
                          <h3 className="modelTitle">{product.name}</h3>
                          <p className="price">S/ {finalPrice.toFixed(2)}</p>
                          <button disabled={!user} onClick={() => addToCart(product.id)}>
                            Agregar al carrito
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </section>
          </main>
        </section>
      )}

      {!checkoutOpen && activeView === "store" && isAdmin && (
        <section className="panel admin">
          <h2>Admin: crear producto</h2>
          <form onSubmit={createProduct} className="adminForm">
            <input
              placeholder="Nombre"
              value={productForm.name}
              onChange={(event) =>
                setProductForm({ ...productForm, name: event.target.value })
              }
              required
            />
            <select
              value={productForm.category}
              onChange={(event) =>
                setProductForm({ ...productForm, category: event.target.value })
              }
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {CATEGORY_LABELS[option]}
                </option>
              ))}
            </select>
            <input
              placeholder="Precio"
              type="number"
              min="0.01"
              step="0.01"
              value={productForm.price}
              onChange={(event) =>
                setProductForm({ ...productForm, price: event.target.value })
              }
              required
            />
            <input
              placeholder="% Descuento"
              type="number"
              min="0"
              max="90"
              value={productForm.discountPercent}
              onChange={(event) =>
                setProductForm({
                  ...productForm,
                  discountPercent: event.target.value,
                })
              }
            />
            <input
              placeholder="Cupon (opcional)"
              value={productForm.couponCode}
              onChange={(event) =>
                setProductForm({ ...productForm, couponCode: event.target.value })
              }
            />
            <input
              placeholder="Stock"
              type="number"
              min="0"
              value={productForm.stock}
              onChange={(event) =>
                setProductForm({ ...productForm, stock: event.target.value })
              }
              required
            />
            <input
              placeholder="URL imagen"
              value={productForm.imageUrl}
              onChange={(event) =>
                setProductForm({ ...productForm, imageUrl: event.target.value })
              }
            />
            <textarea
              placeholder="Descripcion"
              value={productForm.description}
              onChange={(event) =>
                setProductForm({
                  ...productForm,
                  description: event.target.value,
                })
              }
              required
            />
            <button>Crear producto</button>
          </form>
        </section>
      )}

      {!checkoutOpen && activeView === "store" && (
        <section className="promoTicker" aria-label="Promociones">
          <div className="promoTrack">
            {[...promoMessages, ...promoMessages].map((promo, index) => (
              <span key={`${promo}-${index}`} className="promoItem">
                {promo}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
