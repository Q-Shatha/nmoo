const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type RequestOptions = Omit<RequestInit, "body"> & {
  token?: string;
  body?: unknown;
};

export type UserRole = "BUYER" | "VENDOR" | "ADMIN";
export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
export type DiscountType = "FIXED" | "PERCENTAGE";
export type ShippingCarrier = string;
export type StoreStatus = "ACTIVE" | "PAUSED" | "DELETED";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  storeUsername?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  theme?: VendorTheme | null;
  country?: string | null;
  phoneNumber?: string | null;
  region?: string | null;
  city?: string | null;
  district?: string | null;
  street?: string | null;
  buildingNumber?: string | null;
  postalCode?: string | null;
  nationalAddress?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  accessToken: string;
  user: ApiUser;
};

export type Category = {
  id: string;
  vendorId?: string | null;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
};

export type ProductImage = {
  id: string;
  productId: string;
  url: string;
  alt?: string | null;
  sortOrder: number;
};

export type ProductOption = {
  id: string;
  productId: string;
  name: string;
  values: string[];
  valueQuantities?: Record<string, number>;
  valuePrices?: Record<string, number>;
  sortOrder: number;
};

export type Product = {
  id: string;
  vendorId: string;
  categoryId?: string | null;
  title: string;
  slug: string;
  description?: string | null;
  badgeLabel?: string | null;
  price: string;
  discountType?: DiscountType | null;
  discountValue?: string | null;
  salePrice?: string;
  hasDiscount?: boolean;
  stock: number;
  status: ProductStatus;
  imageUrl?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  vendor?: ApiUser;
  images?: ProductImage[];
  options?: ProductOption[];
};

export type Review = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Pick<ApiUser, "id" | "name" | "avatarUrl" | "city">;
  product?: Pick<Product, "id" | "title" | "vendorId">;
};

export type ReviewInput = {
  productId: string;
  rating: number;
  comment?: string;
};

export type ReviewableProduct = Pick<Product, "id" | "title" | "vendorId">;

export type PaginatedProducts = {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ProductQuery = {
  q?: string;
  category?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "latest" | "price_asc" | "price_desc";
  filter?: "discounts" | "recent";
  page?: number;
  limit?: number;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  country?: string;
  phoneNumber?: string;
  region?: string;
  city?: string;
  district?: string;
  street?: string;
  buildingNumber?: string;
  postalCode?: string;
  nationalAddress?: string;
};

export type AddressInput = {
  country: string;
  phoneNumber: string;
  region: string;
  city: string;
  district: string;
  street: string;
  buildingNumber: string;
  postalCode: string;
  nationalAddress?: string;
};

export type ProfileInput = {
  name?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type ProductInput = {
  title: string;
  description?: string;
  badgeLabel?: string;
  price: number;
  discountType?: DiscountType;
  discountValue?: number;
  stock?: number;
  categoryId?: string;
  imageUrl?: string;
  imageUrls?: string[];
  options?: Array<{
    name: string;
    values: string[];
    valueQuantities?: Record<string, number>;
    valuePrices?: Record<string, number>;
  }>;
  status?: ProductStatus;
};

export type ProductImageUpload = {
  key: string;
  url: string;
};

export type ShippingUnavailableLocation = {
  country: string;
  region?: string;
  city?: string;
};

export type ShippingDeliveryLocation = ShippingUnavailableLocation;

export type ShippingMethod = {
  id: string;
  vendorId: string;
  code: string;
  name: string;
  description?: string | null;
  eta?: string | null;
  fee: string;
  enabled: boolean;
  cashOnDeliveryEnabled: boolean;
  excludedRegions: string[];
  unavailableLocations: ShippingUnavailableLocation[];
  deliveryLocations: ShippingDeliveryLocation[];
  createdAt: string;
  updatedAt: string;
};

export type CheckoutShippingOption = {
  code: string;
  name: string;
  description?: string | null;
  eta?: string | null;
  fee: string;
  cashOnDeliveryEnabled: boolean;
  vendorCount: number;
};

export type ShippingMethodInput = {
  code: string;
  name: string;
  fee: number;
  description?: string;
  eta?: string;
  enabled?: boolean;
  cashOnDeliveryEnabled?: boolean;
  excludedRegions?: string[];
  unavailableLocations?: ShippingUnavailableLocation[];
  deliveryLocations?: ShippingDeliveryLocation[];
};

export type ShippingCoverageResult = {
  supported: boolean;
};

export type StorePage = {
  id: string;
  vendorId: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  vendor?: ApiUser;
};

export type StorePageInput = {
  title: string;
  slug?: string;
  content: string;
  published?: boolean;
};

export type ThemeTokens = {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  primaryFixed: string;
  primaryFixedDim: string;
  onPrimaryFixed: string;
  onPrimaryFixedVariant: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  secondaryFixed: string;
  secondaryFixedDim: string;
  onSecondaryFixed: string;
  onSecondaryFixedVariant: string;
  inversePrimary: string;
  surfaceTint: string;
};

export type VendorTheme = {
  id?: string;
  vendorId?: string;
  vendor?: ApiUser;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  storeName?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  storefrontImageUrl?: string | null;
  storefrontTitle?: string | null;
  storefrontDescription?: string | null;
  templateId?: string | null;
  storeStatus?: StoreStatus;
  storeDeletedAt?: string | null;
  cashOnDeliveryEnabled?: boolean;
  whatsappUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  lineUrl?: string | null;
  telegramUrl?: string | null;
  xUrl?: string | null;
  snapchatUrl?: string | null;
  youtubeUrl?: string | null;
  contactEmail?: string | null;
  websiteUrl?: string | null;
  tokens: ThemeTokens;
};

export type ThemeInput = {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  storeName?: string;
  logoUrl?: string;
  bannerUrl?: string;
  storefrontImageUrl?: string;
  storefrontTitle?: string;
  storefrontDescription?: string;
  templateId?: string;
  cashOnDeliveryEnabled?: boolean;
  whatsappUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  lineUrl?: string;
  telegramUrl?: string;
  xUrl?: string;
  snapchatUrl?: string;
  youtubeUrl?: string;
  contactEmail?: string;
  websiteUrl?: string;
};

export type DiscountCode = {
  id: string;
  vendorId: string;
  code: string;
  description?: string | null;
  type: DiscountType;
  value: string;
  enabled: boolean;
  maxUses?: number | null;
  maxUsesPerUser?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    redemptions: number;
  };
};

export type DiscountCodeInput = {
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  enabled?: boolean;
  maxUses?: number;
  maxUsesPerUser?: number;
  startsAt?: string;
  expiresAt?: string;
};

export type DiscountValidationResult = {
  code: string;
  vendorId: string;
  type: DiscountType;
  value: string;
  amount: string;
  description?: string | null;
};

export type CreateOrderInput = {
  shippingCarrier: ShippingCarrier;
  paymentMethod?: "ONLINE" | "CASH_ON_DELIVERY";
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  discountCode?: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product?: Product;
};

export type Order = {
  id: string;
  buyerId: string;
  status: OrderStatus;
  total: string;
  shippingCarrier?: ShippingCarrier | null;
  shippingFee?: string;
  paymentMethod?: "ONLINE" | "CASH_ON_DELIVERY";
  discountCode?: string | null;
  discountAmount?: string;
  createdAt: string;
  updatedAt: string;
  buyer?: ApiUser;
  items: OrderItem[];
};

export type CheckoutSession = {
  checkoutUrl: string | null;
  sessionId: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const url = new URL(`/api${path}`, API_BASE_URL);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const { token, body, headers, ...requestOptions } = options;
  const response = await fetch(buildUrl(path), {
    ...requestOptions,
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "message" in payload
        ? String((payload as { message: unknown }).message)
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export function getProducts(query: ProductQuery = {}) {
  return apiRequest<PaginatedProducts>(buildUrlPath("/products", query), { cache: "no-store" });
}

export function getProductById(id: string) {
  return apiRequest<Product>(`/products/${id}`, { cache: "no-store" });
}

export function getVendorReviews(vendorId: string) {
  return apiRequest<Review[]>(`/reviews/vendor/${vendorId}`, {
    cache: "no-store",
  });
}

export function getProductReviews(productId: string) {
  return apiRequest<Review[]>(`/reviews/product/${productId}`, {
    cache: "no-store",
  });
}

export function getReviewableProducts(vendorId: string, token: string) {
  return apiRequest<ReviewableProduct[]>(`/reviews/vendor/${vendorId}/reviewable-products`, {
    token,
    cache: "no-store",
  });
}

export function createReview(input: ReviewInput, token: string) {
  return apiRequest<Review>("/reviews", {
    method: "POST",
    token,
    body: input,
  });
}

export function getMyProducts(token: string) {
  return apiRequest<Product[]>("/products/me", {
    token,
    cache: "no-store",
  });
}

export function login(input: LoginInput) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: input,
  });
}

export function register(input: RegisterInput) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: input,
  });
}

export function getMe(token: string) {
  return apiRequest<ApiUser>("/auth/me", {
    token,
    cache: "no-store",
  });
}

export function getVendor(id: string) {
  return apiRequest<ApiUser>(`/users/vendors/${id}`, {
    cache: "no-store",
  });
}

export function getVendorByUsername(username: string) {
  return apiRequest<ApiUser>(`/users/vendors/by-username/${username}`, {
    cache: "no-store",
  });
}

export function checkStoreUsernameAvailability(username: string, token: string) {
  return apiRequest<{ storeUsername: string; available: boolean }>(`/users/store-username/availability?username=${encodeURIComponent(username)}`, {
    token,
    cache: "no-store",
  });
}

export function updateMyStoreUsername(storeUsername: string, token: string) {
  return apiRequest<ApiUser>("/users/me/store-username", {
    method: "PATCH",
    token,
    body: { storeUsername },
  });
}

export function updateMyStoreStatus(status: Exclude<StoreStatus, "DELETED">, token: string) {
  return apiRequest<VendorTheme>("/users/me/store-status", {
    method: "PATCH",
    token,
    body: { status },
  });
}

export function deleteMyStore(token: string) {
  return apiRequest<{ deleted: boolean }>("/users/me/store", {
    method: "DELETE",
    token,
  });
}

export function getCategories() {
  return apiRequest<Category[]>("/categories", {
    cache: "no-store",
  });
}

export function getMyCategories(token: string) {
  return apiRequest<Category[]>("/categories/me", {
    token,
    cache: "no-store",
  });
}

export function createCategory(input: { name: string; slug?: string }, token: string) {
  return apiRequest<Category>("/categories", {
    method: "POST",
    token,
    body: input,
  });
}

export function updateCategory(id: string, input: { name?: string; slug?: string }, token: string) {
  return apiRequest<Category>(`/categories/${id}`, {
    method: "PATCH",
    token,
    body: input,
  });
}

export function deleteCategory(id: string, token: string) {
  return apiRequest<Category>(`/categories/${id}`, {
    method: "DELETE",
    token,
  });
}

export function createProduct(input: ProductInput, token: string) {
  return apiRequest<Product>("/products", {
    method: "POST",
    token,
    body: input,
  });
}

export function updateProduct(id: string, input: Partial<ProductInput>, token: string) {
  return apiRequest<Product>(`/products/${id}`, {
    method: "PATCH",
    token,
    body: input,
  });
}

export function deleteProduct(id: string, token: string) {
  return apiRequest<Product>(`/products/${id}`, {
    method: "DELETE",
    token,
  });
}

export function restoreProduct(id: string, token: string) {
  return apiRequest<Product>(`/products/${id}/restore`, {
    method: "PATCH",
    token,
  });
}

export async function uploadProductImage(file: File, token: string) {
  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch(buildUrl("/products/images"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "message" in payload
        ? String((payload as { message: unknown }).message)
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  return payload as ProductImageUpload;
}

export async function uploadMyAvatar(file: File, token: string) {
  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch(buildUrl("/users/me/avatar"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "message" in payload
        ? String((payload as { message: unknown }).message)
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  return payload as ApiUser;
}

export function createOrder(input: CreateOrderInput, token: string) {
  return apiRequest<Order>("/orders", {
    method: "POST",
    token,
    body: input,
  });
}

export function getOrders(token: string) {
  return apiRequest<Order[]>("/orders", {
    token,
    cache: "no-store",
  });
}

export function getOrder(id: string, token: string) {
  return apiRequest<Order>(`/orders/${id}`, {
    token,
    cache: "no-store",
  });
}

export function updateOrderStatus(id: string, status: OrderStatus, token: string) {
  return apiRequest<Order>(`/orders/${id}/status`, {
    method: "PATCH",
    token,
    body: { status },
  });
}

export function getMyShippingMethods(token: string) {
  return apiRequest<ShippingMethod[]>("/shipping-methods/me", {
    token,
    cache: "no-store",
  });
}

export function getMyDiscountCodes(token: string) {
  return apiRequest<DiscountCode[]>("/discounts/me", {
    token,
    cache: "no-store",
  });
}

export function validateDiscountCode(input: { code: string; items: CreateOrderInput["items"] }, token: string) {
  return apiRequest<DiscountValidationResult>("/discounts/validate", {
    method: "POST",
    token,
    body: input,
    cache: "no-store",
  });
}

export function createDiscountCode(input: DiscountCodeInput, token: string) {
  return apiRequest<DiscountCode>("/discounts", {
    method: "POST",
    token,
    body: input,
  });
}

export function updateDiscountCode(id: string, input: Partial<DiscountCodeInput>, token: string) {
  return apiRequest<DiscountCode>(`/discounts/${id}`, {
    method: "PATCH",
    token,
    body: input,
  });
}

export function deleteDiscountCode(id: string, token: string) {
  return apiRequest<DiscountCode>(`/discounts/${id}`, {
    method: "DELETE",
    token,
  });
}

export function getCheckoutShippingOptions(input: Pick<CreateOrderInput, "items"> & { destinationCountry?: string; destinationRegion?: string; destinationCity?: string }) {
  return apiRequest<CheckoutShippingOption[]>("/shipping-methods/checkout-options", {
    method: "POST",
    body: input,
    cache: "no-store",
  });
}

export function getVendorShippingCoverage(vendorId: string, input: { country?: string; region?: string; city?: string }) {
  const params = new URLSearchParams();

  if (input.country) {
    params.set("country", input.country);
  }

  if (input.region) {
    params.set("region", input.region);
  }

  if (input.city) {
    params.set("city", input.city);
  }

  const queryString = params.toString();

  return apiRequest<ShippingCoverageResult>(`/shipping-methods/vendor/${vendorId}/coverage${queryString ? `?${queryString}` : ""}`, {
    cache: "no-store",
  });
}

export function createShippingMethod(input: ShippingMethodInput, token: string) {
  return apiRequest<ShippingMethod>("/shipping-methods", {
    method: "POST",
    token,
    body: input,
  });
}

export function updateShippingMethod(id: string, input: Partial<ShippingMethodInput>, token: string) {
  return apiRequest<ShippingMethod>(`/shipping-methods/${id}`, {
    method: "PATCH",
    token,
    body: input,
  });
}

export function deleteShippingMethod(id: string, token: string) {
  return apiRequest<ShippingMethod>(`/shipping-methods/${id}`, {
    method: "DELETE",
    token,
  });
}

export function getStorePages() {
  return apiRequest<StorePage[]>("/store-pages", {
    cache: "no-store",
  });
}

export function getStorePage(id: string) {
  return apiRequest<StorePage>(`/store-pages/${id}`, {
    cache: "no-store",
  });
}

export function getMyStorePages(token: string) {
  return apiRequest<StorePage[]>("/store-pages/me", {
    token,
    cache: "no-store",
  });
}

export function getVendorStorePages(vendorId: string) {
  return apiRequest<StorePage[]>(`/store-pages/vendor/${vendorId}`, {
    cache: "no-store",
  });
}

export function createStorePage(input: StorePageInput, token: string) {
  return apiRequest<StorePage>("/store-pages", {
    method: "POST",
    token,
    body: input,
  });
}

export function updateStorePage(id: string, input: Partial<StorePageInput>, token: string) {
  return apiRequest<StorePage>(`/store-pages/${id}`, {
    method: "PATCH",
    token,
    body: input,
  });
}

export function deleteStorePage(id: string, token: string) {
  return apiRequest<StorePage>(`/store-pages/${id}`, {
    method: "DELETE",
    token,
  });
}

export function getActiveTheme() {
  return apiRequest<VendorTheme>("/themes/active", {
    cache: "no-store",
  });
}

export function getMyTheme(token: string) {
  return apiRequest<VendorTheme>("/themes/me", {
    token,
    cache: "no-store",
  });
}

export function getVendorTheme(vendorId: string) {
  return apiRequest<VendorTheme>(`/themes/vendor/${vendorId}`, {
    cache: "no-store",
  });
}

export function updateMyTheme(input: ThemeInput, token: string) {
  return apiRequest<VendorTheme>("/themes/me", {
    method: "PATCH",
    token,
    body: input,
  });
}

export function createCheckoutSession(orderId: string, token: string) {
  return apiRequest<CheckoutSession>("/payments/checkout-session", {
    method: "POST",
    token,
    body: {
      orderId,
    },
  });
}

export function updateMyAddress(input: AddressInput, token: string) {
  return apiRequest<ApiUser>("/users/me/address", {
    method: "PATCH",
    token,
    body: input,
  });
}

export function updateMyProfile(input: ProfileInput, token: string) {
  return apiRequest<ApiUser>("/users/me/profile", {
    method: "PATCH",
    token,
    body: input,
  });
}

function buildUrlPath(path: string, query: ProductQuery) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}
