const DEFAULT_FRONTEND_URL = "https://nmoo.com";
const DEFAULT_API_URL = "https://api.nmoo.com";

const frontendUrl = normalizeUrl(process.env.FRONTEND_URL || process.argv[2] || DEFAULT_FRONTEND_URL);
const apiUrl = normalizeUrl(process.env.API_URL || process.argv[3] || DEFAULT_API_URL);
const vendorId = process.env.VENDOR_ID || process.argv[4] || "";

const frontendPaths = ["/", "/cart", "/checkout", "/dashboard"];

if (vendorId) {
  frontendPaths.splice(1, 0, `/vendors/${vendorId}`);
}

async function main() {
  console.log(`Frontend: ${frontendUrl}`);
  console.log(`API: ${apiUrl}`);
  console.log(`Vendor scope: ${vendorId || "not provided"}`);

  await checkApiHealth();
  await checkApiProducts();
  await checkCors();
  await checkFrontendPages();

  console.log("Production checks passed.");
}

async function checkApiHealth() {
  const response = await fetch(`${apiUrl}/api`);
  assert(response.ok, `API health failed with ${response.status}`);
  const body = await response.json();
  assert(body.status === "ok", "API health did not return ok status.");
  console.log("OK API health");
}

async function checkApiProducts() {
  if (!vendorId) {
    console.log("SKIP API products (set VENDOR_ID to check a storefront product list)");
    return;
  }

  const response = await fetch(`${apiUrl}/api/products?vendorId=${encodeURIComponent(vendorId)}&page=1&limit=3`);
  assert(response.ok, `API products failed with ${response.status}`);
  const body = await response.json();
  assert(Array.isArray(body.data), "API products response must include a data array.");
  assert(body.meta && typeof body.meta.total === "number", "API products response must include pagination meta.");
  console.log("OK API products");
}

async function checkCors() {
  const corsPath = vendorId ? `/api/products?vendorId=${encodeURIComponent(vendorId)}&page=1&limit=1` : "/api";
  const response = await fetch(`${apiUrl}${corsPath}`, {
    headers: {
      Origin: frontendUrl,
    },
  });

  assert(response.ok, `CORS products request failed with ${response.status}`);
  const allowedOrigin = response.headers.get("access-control-allow-origin");
  assert(
    allowedOrigin === frontendUrl || allowedOrigin === "*",
    `CORS origin mismatch. Expected ${frontendUrl}, got ${allowedOrigin || "empty"}.`,
  );
  console.log("OK CORS");
}

async function checkFrontendPages() {
  for (const path of frontendPaths) {
    const response = await fetch(`${frontendUrl}${path}`);
    assert(response.ok, `Frontend page ${path} failed with ${response.status}`);
    const html = await response.text();
    assert(html.includes("nmoo") || html.includes("نمو"), `Frontend page ${path} did not include the brand.`);
    console.log(`OK frontend ${path}`);
  }
}

function normalizeUrl(value) {
  return value.replace(/\/+$/, "");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
