const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function main() {
  const adminEmail = "admin@ecommercefinal.com";
  const adminPassword = "Admin123*";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        fullName: "Administrador",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      },
    });

    await prisma.cart.create({
      data: { userId: admin.id },
    });
  }

  const rawProducts = [
    ["LAPTOP Core i5-13420H LENOVO V15 G5 IRL 8|512|15.6 FHD IPS W11H", "COMPUTO", 2649, "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=1200"],
    ["LAPTOP Core Ultra 5 125H ASUS E1504GA-NJ474W 8|512|15.6 FHD W11H", "COMPUTO", 2299, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200"],
    ["LAPTOP Core i3-1215U LENOVO V15 G4 IRU 8|512|15.6 FHD W11H", "COMPUTO", 1849, "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=1200"],
    ["LAPTOP Core i7-13620H LENOVO LOQ 15IRX9 24|512|15.6 RTX3050", "GAMING", 4399, "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1200"],
    ["LAPTOP Core i7-13620H DELL G15 5530 16|1TB|15.6 RTX3050", "GAMING", 4699, "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=1200"],
    ["LAPTOP Core 7-240H ASUS FX607VU-RL022W 16|512|16 RTX4050", "GAMING", 4899, "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200"],
    ["LAPTOP Ryzen AI 9 HX 370 ASUS S5507QA-MA005W 32|1TB OLED", "COMPUTO", 6299, "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200"],
    ["LAPTOP Snapdragon X Plus ASUS P5405CSA-NZ019W 16|512|14", "COMPUTO", 4199, "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=1200"],

    ["MONITOR 24 LG 24U411A-B 23.8 IPS FHD 100HZ", "COMPUTO", 359, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200"],
    ["MONITOR 27 LG 27GS50F-B 27 VA FHD 180HZ", "GAMING", 649, "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1200"],
    ["MONITOR 34 SAMSUNG LS34C500GALXPE 34 VA WQHD", "COMPUTO", 1099, "https://images.unsplash.com/photo-1527814050087-3793815479db?w=1200"],
    ["MONITOR 31.5 ASUS VA329HE 31.5 IPS FHD 75HZ", "COMPUTO", 799, "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200"],
    ["MONITOR 27 LG 27MS500-B 27 IPS FHD 100HZ", "COMPUTO", 529, "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200"],
    ["MONITOR 27 MSI G274F 27 IPS FHD 180HZ", "GAMING", 929, "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200"],

    ["MOUSE LOGITECH M280 WIRELESS RED 1000DPI USB NANO", "PERIFERICOS", 69, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200"],
    ["MOUSE LOGITECH G203 RGB LIGHTSYNC BLACK 8000DPI", "GAMING", 89, "https://images.unsplash.com/photo-1629429407756-01cd3d7cfb38?w=1200"],
    ["MOUSE GAMING GENIUS SCORPION M500 RGB USB", "GAMING", 59, "https://images.unsplash.com/photo-1613141412501-9012977f1969?w=1200"],
    ["MOUSE HALION GAMING STORM GM200 BLACK", "GAMING", 49, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1200"],
    ["MOUSE HP X1000 WIRELESS BLACK", "PERIFERICOS", 45, "https://images.unsplash.com/photo-1586349906319-48d20e9d17cb?w=1200"],

    ["TECLADO MECANICO REDRAGON K552 RGB", "GAMING", 169, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1200"],
    ["TECLADO LOGITECH K120 USB", "PERIFERICOS", 55, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200"],
    ["TECLADO INALAMBRICO LOGITECH K270", "PERIFERICOS", 129, "https://images.unsplash.com/photo-1595225476474-87563907a212?w=1200"],
    ["TECLADO MECANICO HYPERX ALLOY ORIGINS", "GAMING", 359, "https://images.unsplash.com/photo-1613141411244-0e4ac259d217?w=1200"],
    ["TECLADO MECANICO RAZER BLACKWIDOW V4", "GAMING", 599, "https://images.unsplash.com/photo-1630975797856-7f4dcf5b4d5f?w=1200"],

    ["TABLET LENOVO Tab Plus 8|256|12.7", "MOVIL", 1699, "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=1200"],
    ["TABLET LENOVO Tab M11 4|128|11", "MOVIL", 899, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200"],
    ["TABLET SAMSUNG Galaxy Tab A9+ 8|128", "MOVIL", 1099, "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=1200"],

    ["IPHONE 15 128GB BLACK", "MOVIL", 3599, "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200"],
    ["IPHONE 16 PRO 256GB TITANIUM", "MOVIL", 5999, "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1200"],
    ["SAMSUNG Galaxy S24 256GB", "MOVIL", 3199, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200"],
    ["SAMSUNG Galaxy A55 5G 256GB", "MOVIL", 1749, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200"],
    ["MOTOROLA Edge 50 Fusion 256GB", "MOVIL", 1699, "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200"],
    ["XIAOMI Redmi Note 13 Pro 256GB", "MOVIL", 1499, "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=1200"],

    ["AUDIFONOS JBL Tune 520BT", "AUDIO", 189, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200"],
    ["PARLANTE BLUETOOTH ANKER SOUNDCORE", "AUDIO", 229, "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=1200"],
    ["WEBCAM LOGITECH C920 HD PRO", "PERIFERICOS", 329, "https://images.unsplash.com/photo-1587825140400-35e8d7f8b5f8?w=1200"],
  ];

  const products = rawProducts.map(([name, category, price, imageUrl], index) => ({
    name,
    slug: slugify(name),
    description: `${name}. Producto de catalogo comercial para tienda e-commerce con informacion real de mercado.`,
    category,
    price,
    discountPercent: index % 4 === 0 ? 12 : index % 3 === 0 ? 8 : 0,
    couponCode: index % 5 === 0 ? "PROMO2026" : null,
    stock: 10 + ((index * 3) % 35),
    imageUrl,
  }));

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        discountPercent: product.discountPercent,
        couponCode: product.couponCode,
        stock: product.stock,
        imageUrl: product.imageUrl,
        isActive: true,
      },
      create: {
        ...product,
        isActive: true,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
