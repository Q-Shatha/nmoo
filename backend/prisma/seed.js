const { DiscountType, PrismaClient, ProductStatus, UserRole } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const password = "Nmoo12345";

const categories = [
  { name: "الأزياء", slug: "fashion" },
  { name: "العناية والجمال", slug: "beauty" },
  { name: "المنزل", slug: "home" },
  { name: "الإكسسوارات", slug: "accessories" },
];

const products = [
  {
    title: "عباية يومية ناعمة",
    slug: "soft-daily-abaya",
    description: "عباية عملية بقماش خفيف مناسبة للمشاوير اليومية والعمل.",
    price: 249,
    stock: 18,
    categorySlug: "fashion",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "حقيبة كتف أنيقة",
    slug: "elegant-shoulder-bag",
    description: "حقيبة صغيرة بتصميم مرتب ومساحة مناسبة للأغراض الأساسية.",
    price: 189,
    stock: 24,
    categorySlug: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "شمعة عطرية فاخرة",
    slug: "luxury-scented-candle",
    description: "شمعة برائحة هادئة تضيف دفئاً ولمسة جميلة للمكان.",
    price: 79,
    stock: 40,
    categorySlug: "home",
    imageUrl: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "سيروم ترطيب يومي",
    slug: "daily-hydration-serum",
    description: "سيروم خفيف للعناية اليومية وترطيب البشرة قبل المكياج.",
    price: 129,
    stock: 32,
    categorySlug: "beauty",
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "طقم أكواب قهوة",
    slug: "coffee-cups-set",
    description: "طقم أكواب بتصميم بسيط مناسب للقهوة العربية والقهوة المختصة.",
    price: 99,
    stock: 21,
    categorySlug: "home",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "سوار ذهبي بسيط",
    slug: "minimal-gold-bracelet",
    description: "سوار ناعم للاستخدام اليومي أو تنسيقه مع إكسسوارات أخرى.",
    price: 159,
    stock: 15,
    categorySlug: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=80",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(password, 10);

  const vendor = await prisma.user.upsert({
    where: { email: "vendor@nmoo.test" },
    update: {
      name: "تاجر نمو",
      role: UserRole.VENDOR,
      passwordHash,
    },
    create: {
      name: "تاجر نمو",
      email: "vendor@nmoo.test",
      passwordHash,
      role: UserRole.VENDOR,
    },
  });

  await prisma.user.upsert({
    where: { email: "buyer@nmoo.test" },
    update: {
      name: "عميل نمو",
      role: UserRole.BUYER,
      passwordHash,
      country: "SA",
      phoneNumber: "+966501234567",
      region: "منطقة الرياض",
      city: "الرياض",
      district: "حي العارض",
      street: "شارع الملك سلمان",
      buildingNumber: "12",
      postalCode: "13332",
      nationalAddress: "حي العارض، شارع الملك سلمان، مبنى 12، الرمز البريدي 13332",
    },
    create: {
      name: "عميل نمو",
      email: "buyer@nmoo.test",
      passwordHash,
      role: UserRole.BUYER,
      country: "SA",
      phoneNumber: "+966501234567",
      region: "منطقة الرياض",
      city: "الرياض",
      district: "حي العارض",
      street: "شارع الملك سلمان",
      buildingNumber: "12",
      postalCode: "13332",
      nationalAddress: "حي العارض، شارع الملك سلمان، مبنى 12، الرمز البريدي 13332",
    },
  });

  await prisma.vendorSubscription.upsert({
    where: { vendorId: vendor.id },
    update: {
      plan: "pro",
      status: "active",
      startedAt: new Date(),
    },
    create: {
      vendorId: vendor.id,
      plan: "pro",
      status: "active",
      startedAt: new Date(),
    },
  });

  await prisma.vendorTheme.upsert({
    where: { vendorId: vendor.id },
    update: {
      primaryColor: "#884a70",
      secondaryColor: "#1e293b",
    },
    create: {
      vendorId: vendor.id,
      primaryColor: "#884a70",
      secondaryColor: "#1e293b",
    },
  });

  await prisma.vendorShippingMethod.upsert({
    where: {
      vendorId_code: {
        vendorId: vendor.id,
        code: "spl",
      },
    },
    update: {
      name: "سبل",
      description: "خيار اقتصادي مناسب لمعظم المدن داخل السعودية.",
      eta: "2 - 5 أيام عمل",
      fee: 20,
      enabled: true,
    },
    create: {
      vendorId: vendor.id,
      code: "spl",
      name: "سبل",
      description: "خيار اقتصادي مناسب لمعظم المدن داخل السعودية.",
      eta: "2 - 5 أيام عمل",
      fee: 20,
      enabled: true,
    },
  });

  await prisma.vendorShippingMethod.upsert({
    where: {
      vendorId_code: {
        vendorId: vendor.id,
        code: "smsa",
      },
    },
    update: {
      name: "سمسا",
      description: "توصيل سريع مع تتبع واضح للشحنة.",
      eta: "1 - 3 أيام عمل",
      fee: 25,
      enabled: true,
    },
    create: {
      vendorId: vendor.id,
      code: "smsa",
      name: "سمسا",
      description: "توصيل سريع مع تتبع واضح للشحنة.",
      eta: "1 - 3 أيام عمل",
      fee: 25,
      enabled: true,
    },
  });

  await prisma.discountCode.upsert({
    where: {
      vendorId_code: {
        vendorId: vendor.id,
        code: "WELCOME10",
      },
    },
    update: {
      description: "خصم ترحيبي 10% للطلبات التجريبية",
      type: DiscountType.PERCENTAGE,
      value: 10,
      enabled: true,
      maxUses: 100,
      maxUsesPerUser: 1,
    },
    create: {
      vendorId: vendor.id,
      code: "WELCOME10",
      description: "خصم ترحيبي 10% للطلبات التجريبية",
      type: DiscountType.PERCENTAGE,
      value: 10,
      enabled: true,
      maxUses: 100,
      maxUsesPerUser: 1,
    },
  });

  await prisma.storePage.upsert({
    where: {
      vendorId_slug: {
        vendorId: vendor.id,
        slug: "return-policy",
      },
    },
    update: {
      title: "سياسة الاسترجاع",
      content: "يمكن استرجاع المنتجات خلال 7 أيام من استلام الطلب بشرط أن تكون بحالتها الأصلية وغير مستخدمة. رسوم الشحن غير مستردة إلا في حال وجود خطأ من المتجر.",
      published: true,
    },
    create: {
      vendorId: vendor.id,
      title: "سياسة الاسترجاع",
      slug: "return-policy",
      content: "يمكن استرجاع المنتجات خلال 7 أيام من استلام الطلب بشرط أن تكون بحالتها الأصلية وغير مستخدمة. رسوم الشحن غير مستردة إلا في حال وجود خطأ من المتجر.",
      published: true,
    },
  });

  await prisma.storePage.upsert({
    where: {
      vendorId_slug: {
        vendorId: vendor.id,
        slug: "about-store",
      },
    },
    update: {
      title: "عن متجر نمو",
      content: "متجر نمو يقدم منتجات مختارة بعناية للتسوق اليومي، مع تجربة شراء عربية واضحة وخيارات شحن مفعلة من التاجر.",
      published: true,
    },
    create: {
      vendorId: vendor.id,
      title: "عن متجر نمو",
      slug: "about-store",
      content: "متجر نمو يقدم منتجات مختارة بعناية للتسوق اليومي، مع تجربة شراء عربية واضحة وخيارات شحن مفعلة من التاجر.",
      published: true,
    },
  });

  const categoriesBySlug = new Map();

  for (const category of categories) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        slug: category.slug,
        vendorId: null,
      },
    });
    const savedCategory = existingCategory
      ? await prisma.category.update({
          where: { id: existingCategory.id },
          data: { name: category.name },
        })
      : await prisma.category.create({
          data: category,
        });

    categoriesBySlug.set(category.slug, savedCategory);
  }

  for (const product of products) {
    const category = categoriesBySlug.get(product.categorySlug);
    const savedProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        title: product.title,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        status: ProductStatus.ACTIVE,
        vendorId: vendor.id,
        categoryId: category?.id,
      },
      create: {
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        status: ProductStatus.ACTIVE,
        vendorId: vendor.id,
        categoryId: category?.id,
      },
    });

    await prisma.productImage.deleteMany({
      where: { productId: savedProduct.id },
    });

    await prisma.productImage.create({
      data: {
        productId: savedProduct.id,
        url: product.imageUrl,
        alt: product.title,
        sortOrder: 0,
      },
    });
  }

  console.log("Seed completed.");
  console.log(`Vendor: vendor@nmoo.test / ${password}`);
  console.log(`Buyer: buyer@nmoo.test / ${password}`);
  console.log(`Products: ${products.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
