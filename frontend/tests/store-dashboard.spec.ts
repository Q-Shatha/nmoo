import { APIRequestContext, expect, request as playwrightRequest, test } from "@playwright/test";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
  };
};

type ProductResponse = {
  id: string;
  title: string;
};

let api: APIRequestContext;
let vendorToken = "";
let buyerToken = "";
let vendorId = "";
let productId = "";
let productTitle = "";

test.beforeAll(async () => {
  api = await playwrightRequest.newContext({
    baseURL: apiBaseUrl,
    extraHTTPHeaders: {
      Accept: "application/json",
    },
  });

  const stamp = Date.now();
  productTitle = `Playwright Product ${stamp}`;

  const vendorResponse = await api.post("/api/auth/register", {
    data: {
      name: "Playwright Vendor",
      email: `playwright-vendor-${stamp}@nmoo.test`,
      password: "StrongPassword123",
      role: "VENDOR",
    },
  });
  expect(vendorResponse.ok()).toBeTruthy();
  const vendor = (await vendorResponse.json()) as AuthResponse;
  vendorToken = vendor.accessToken;
  vendorId = vendor.user.id;

  const productResponse = await api.post("/api/products", {
    headers: {
      Authorization: `Bearer ${vendorToken}`,
    },
    data: {
      title: productTitle,
      description: "Product created by Playwright frontend tests",
      price: 135,
      stock: 6,
      status: "ACTIVE",
    },
  });
  expect(productResponse.ok()).toBeTruthy();
  const product = (await productResponse.json()) as ProductResponse;
  productId = product.id;

  const shippingMethodResponse = await api.post("/api/shipping-methods", {
    headers: {
      Authorization: `Bearer ${vendorToken}`,
    },
    data: {
      code: "spl",
      name: "سبل",
      fee: 20,
      eta: "2 - 5 أيام عمل",
      enabled: true,
    },
  });
  expect(shippingMethodResponse.ok()).toBeTruthy();

  const buyerResponse = await api.post("/api/auth/register", {
    data: {
      name: "Playwright Buyer",
      email: `playwright-buyer-${stamp}@nmoo.test`,
      password: "StrongPassword123",
      role: "BUYER",
    },
  });
  expect(buyerResponse.ok()).toBeTruthy();
  const buyer = (await buyerResponse.json()) as AuthResponse;
  buyerToken = buyer.accessToken;

  const orderResponse = await api.post("/api/orders", {
    headers: {
      Authorization: `Bearer ${buyerToken}`,
    },
    data: {
      shippingCarrier: "spl",
      items: [{ productId, quantity: 1 }],
    },
  });
  expect(orderResponse.ok()).toBeTruthy();
});

test.afterAll(async () => {
  await api?.dispose();
});

test("home page appears", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/nmoo/);
  await expect(page.getByRole("banner").getByRole("link", { name: "ابدأ مجانا" })).toBeVisible();
});

test("login link opens the login page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "تسجيل الدخول" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "تسجيل الدخول" })).toBeVisible();
});

test("store searches for a product", async ({ page }) => {
  await page.goto(`/vendors/${vendorId}/storefront?q=${encodeURIComponent(productTitle)}`);
  await expect(page.getByRole("heading", { name: productTitle })).toBeVisible();
  await expect(page.getByText("لا توجد منتجات مطابقة")).toHaveCount(0);
});

test("product page opens", async ({ page }) => {
  await page.goto(`/vendors/${vendorId}/products/${productId}`);
  await expect(page.getByRole("heading", { name: productTitle })).toBeVisible();
  await expect(page.getByText("Product created by Playwright frontend tests")).toBeVisible();
});

test("dashboard appears with authenticated vendor data", async ({ context, page }) => {
  await context.addCookies([
    {
      name: "nmoo_access_token",
      value: vendorToken,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "لوحة التحكم" })).toBeVisible();
  await expect(page.getByText("إجمالي المبيعات")).toBeVisible();
  await expect(page.locator("#products").getByRole("heading", { name: productTitle })).toBeVisible();
});

test("header shows account menu after login", async ({ context, page }) => {
  await context.addCookies([
    {
      name: "nmoo_access_token",
      value: vendorToken,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/");
  await page.getByRole("button", { name: /Playwright Vendor/ }).click();
  await expect(page.getByRole("menuitem", { name: "طلباتي" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "إعدادات الحساب" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "تسجيل الخروج" })).toBeVisible();
});

test("buyer account menu does not show dashboard", async ({ context, page }) => {
  await context.addCookies([
    {
      name: "nmoo_access_token",
      value: buyerToken,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/");
  await page.getByRole("button", { name: /Playwright Buyer/ }).click();
  await expect(page.getByRole("menuitem", { name: "لوحة التحكم" })).toHaveCount(0);
  await expect(page.getByRole("menuitem", { name: "عنوان الشحن" })).toBeVisible();
});

test("buyer address page separates national address from street details", async ({ context, page }) => {
  await context.addCookies([
    {
      name: "nmoo_access_token",
      value: buyerToken,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/account/address");
  await expect(page.getByRole("heading", { name: "إعداد عنوان الشحن" })).toBeVisible();
  await expect(page.locator("select").nth(0)).toContainText("اليابان");
  await expect(page.locator("select").nth(0)).toContainText("الولايات المتحدة");
  await expect(page.locator("select").nth(1)).toContainText("منطقة الرياض");
  await expect(page.locator("select").nth(2)).toContainText("وادي الدواسر");
  await expect(page.getByLabel("رقم الجوال")).toBeVisible();
  await expect(page.getByLabel("الحي")).toBeVisible();
  await expect(page.getByLabel("رقم المبنى أو البيت")).toBeVisible();
  await expect(page.getByLabel("العنوان الوطني")).toBeVisible();

  await page.locator("select").nth(0).selectOption("AE");
  await expect(page.getByLabel("العنوان الوطني")).toHaveCount(0);
});
