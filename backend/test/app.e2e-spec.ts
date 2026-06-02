import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ProductStatus, UserRole } from "@prisma/client";
import request = require("supertest");
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("nmoo API (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let buyerToken: string;
  let vendorToken: string;
  let otherVendorToken: string;
  let buyerId: string;
  let vendorId: string;
  let productId: string;
  let orderId: string;
  let vendorCategoryId: string;
  const stamp = Date.now();
  const buyerEmail = `e2e-buyer-${stamp}@nmoo.test`;
  const vendorEmail = `e2e-vendor-${stamp}@nmoo.test`;
  const otherVendorEmail = `e2e-other-vendor-${stamp}@nmoo.test`;
  const productTitle = `E2E Product ${stamp}`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (orderId) {
      await prisma.orderItem.deleteMany({ where: { orderId } });
      await prisma.order.deleteMany({ where: { id: orderId } });
    }

    if (productId) {
      await prisma.product.deleteMany({ where: { id: productId } });
    }

    if (vendorCategoryId) {
      await prisma.category.deleteMany({ where: { id: vendorCategoryId } });
    }

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [buyerEmail, vendorEmail, otherVendorEmail],
        },
      },
    });

    await app.close();
  });

  it("registers buyer and vendor accounts", async () => {
    const buyerResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        name: "E2E Buyer",
        email: buyerEmail,
        password: "StrongPassword123",
        role: UserRole.BUYER,
      })
      .expect(201);

    expect(buyerResponse.body.accessToken).toEqual(expect.any(String));
    expect(buyerResponse.body.user).toMatchObject({
      email: buyerEmail,
      role: UserRole.BUYER,
    });
    expect(buyerResponse.body.user).not.toHaveProperty("passwordHash");

    buyerToken = buyerResponse.body.accessToken;
    buyerId = buyerResponse.body.user.id;

    const vendorResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        name: "E2E Vendor",
        email: vendorEmail,
        password: "StrongPassword123",
        role: UserRole.VENDOR,
      })
      .expect(201);

    expect(vendorResponse.body.accessToken).toEqual(expect.any(String));
    expect(vendorResponse.body.user.role).toBe(UserRole.VENDOR);
    expect(vendorResponse.body.user).not.toHaveProperty("passwordHash");

    vendorToken = vendorResponse.body.accessToken;
    vendorId = vendorResponse.body.user.id;
  });

  it("logs in with registered credentials", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        email: buyerEmail,
        password: "StrongPassword123",
      })
      .expect(201);

    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.user.id).toBe(buyerId);
    expect(response.body.user).not.toHaveProperty("passwordHash");
  });

  it("checks and updates the vendor store username", async () => {
    const storeUsername = `e2e-store-${stamp}`;

    const availabilityResponse = await request(app.getHttpServer())
      .get("/api/users/store-username/availability")
      .set("Authorization", `Bearer ${vendorToken}`)
      .query({ username: storeUsername })
      .expect(200);

    expect(availabilityResponse.body).toMatchObject({
      storeUsername,
      available: true,
    });

    const updateResponse = await request(app.getHttpServer())
      .patch("/api/users/me/store-username")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ storeUsername })
      .expect(200);

    expect(updateResponse.body).toMatchObject({
      id: vendorId,
      storeUsername,
    });

    const publicVendorResponse = await request(app.getHttpServer())
      .get(`/api/users/vendors/by-username/${storeUsername}`)
      .expect(200);

    expect(publicVendorResponse.body).toMatchObject({
      id: vendorId,
      storeUsername,
    });
  });

  it("returns the current user without password data", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${buyerToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: buyerId,
      email: buyerEmail,
      role: UserRole.BUYER,
    });
    expect(response.body).not.toHaveProperty("passwordHash");
  });

  it("updates the current user's address", async () => {
    const response = await request(app.getHttpServer())
      .patch("/api/users/me/address")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        country: "SA",
        phoneNumber: "+966501234567",
        region: "منطقة الرياض",
        city: "الرياض",
        district: "حي العارض",
        street: "شارع الملك سلمان",
        buildingNumber: "12",
        postalCode: "13332",
        nationalAddress: "RDBA1234",
      })
      .expect(200);

    expect(response.body).toMatchObject({
      id: buyerId,
      country: "SA",
      phoneNumber: "+966501234567",
      region: "منطقة الرياض",
      city: "الرياض",
      district: "حي العارض",
      street: "شارع الملك سلمان",
      buildingNumber: "12",
      postalCode: "13332",
      nationalAddress: "RDBA1234",
    });
    expect(response.body).not.toHaveProperty("passwordHash");
  });

  it("requires all address fields when updating an address", async () => {
    await request(app.getHttpServer())
      .patch("/api/users/me/address")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        country: "SA",
        region: "منطقة الرياض",
      })
      .expect(400);
  });

  it("blocks product creation without a token", async () => {
    await request(app.getHttpServer())
      .post("/api/products")
      .send({
        title: "Blocked product",
        price: 10,
      })
      .expect(401);
  });

  it("blocks buyers from creating products", async () => {
    await request(app.getHttpServer())
      .post("/api/products")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        title: "Buyer product",
        price: 10,
      })
      .expect(403);
  });

  it("allows vendors to create private categories", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/categories")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({
        name: `Vendor Category ${stamp}`,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      name: `Vendor Category ${stamp}`,
      vendorId,
    });

    vendorCategoryId = response.body.id;

    const categoriesResponse = await request(app.getHttpServer())
      .get("/api/categories/me")
      .set("Authorization", `Bearer ${vendorToken}`)
      .expect(200);

    expect(categoriesResponse.body.some((category: { id: string }) => category.id === vendorCategoryId)).toBe(true);
  });

  it("allows vendors to configure shipping methods", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/shipping-methods")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({
        code: "spl",
        name: "سبل",
        fee: 20,
        description: "شحن محلي",
        eta: "2 - 5 أيام عمل",
        enabled: true,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      vendorId,
      code: "spl",
      name: "سبل",
      fee: "20",
      enabled: true,
    });
  });

  it("allows vendors to create products", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/products")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({
        title: productTitle,
        description: "Created during e2e tests",
        price: 99.5,
        stock: 5,
        categoryId: vendorCategoryId,
        imageUrls: ["https://example.com/e2e-product-1.jpg", "https://example.com/e2e-product-2.jpg"],
        options: [
          { name: "اللون", values: ["أحمر", "أزرق"] },
          { name: "المقاس", values: ["S", "M"] },
        ],
        status: ProductStatus.ACTIVE,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      title: productTitle,
      vendorId,
      categoryId: vendorCategoryId,
      status: ProductStatus.ACTIVE,
    });
    expect(response.body.images).toHaveLength(2);
    expect(response.body.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "اللون", values: ["أحمر", "أزرق"] }),
        expect.objectContaining({ name: "المقاس", values: ["S", "M"] }),
      ]),
    );

    productId = response.body.id;
  });

  it("blocks vendors from managing another store's products", async () => {
    const otherVendorResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        name: "E2E Other Vendor",
        email: otherVendorEmail,
        password: "StrongPassword123",
        role: UserRole.VENDOR,
      })
      .expect(201);

    otherVendorToken = otherVendorResponse.body.accessToken;

    await request(app.getHttpServer())
      .patch(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${otherVendorToken}`)
      .send({
        title: "Blocked cross-store edit",
      })
      .expect(403);
  });

  it("uploads product images when S3 is configured or returns a setup error", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/products/images")
      .set("Authorization", `Bearer ${vendorToken}`)
      .attach("file", Buffer.from("fake-image"), {
        filename: "product.jpg",
        contentType: "image/jpeg",
      });

    expect([201, 503]).toContain(response.status);

    if (response.status === 201) {
      expect(response.body.url).toEqual(expect.any(String));
    }
  });

  it("requires a vendor scope when listing products", async () => {
    await request(app.getHttpServer())
      .get("/api/products")
      .query({
        q: productTitle,
        page: 1,
        limit: 12,
      })
      .expect(400);
  });

  it("searches products inside a vendor store", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/products")
      .query({
        vendorId,
        q: productTitle,
        page: 1,
        limit: 12,
      })
      .expect(200);

    expect(response.body.data.some((product: { id: string }) => product.id === productId)).toBe(true);
    const product = response.body.data.find((item: { id: string }) => item.id === productId);
    expect(product.vendor).not.toHaveProperty("passwordHash");
    expect(response.body.data.length).toBeLessThanOrEqual(12);
    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 12,
    });
    expect(response.body.meta.total).toBeGreaterThanOrEqual(1);
    expect(response.body.meta.totalPages).toBeGreaterThanOrEqual(1);
  });

  it("creates an order", async () => {
    const shippingResponse = await request(app.getHttpServer())
      .post("/api/shipping-methods/checkout-options")
      .send({
        items: [
          {
            productId,
            quantity: 2,
          },
        ],
      })
      .expect(201);

    expect(shippingResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "spl",
          fee: "20.00",
        }),
      ]),
    );

    const response = await request(app.getHttpServer())
      .post("/api/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        shippingCarrier: "spl",
        items: [
          {
            productId,
            quantity: 2,
          },
        ],
      })
      .expect(201);

    expect(response.body).toMatchObject({
      buyerId,
      status: "PENDING",
      shippingCarrier: "spl",
      shippingFee: "20",
      total: "219",
    });

    orderId = response.body.id;
  });

  it("keeps Stripe checkout disabled until configured", async () => {
    await request(app.getHttpServer())
      .post("/api/payments/checkout-session")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        orderId,
      })
      .expect(503);
  });

  it("keeps Stripe webhooks disabled until configured", async () => {
    await request(app.getHttpServer())
      .post("/api/payments/stripe/webhook")
      .set("stripe-signature", "test-signature")
      .send("{}")
      .expect(503);
  });

  it("blocks order status updates without permission", async () => {
    await request(app.getHttpServer())
      .patch(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        status: "PROCESSING",
      })
      .expect(403);
  });
});
