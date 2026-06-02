const required = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "NODE_ENV",
  "FRONTEND_URL",
  "CORS_ORIGINS",
];

const placeholders = new Set([
  "replace-with-strong-secret",
  "change-me",
  "secret",
  "strong-production-secret",
  "generate-a-random-production-secret-with-at-least-32-characters",
]);

function isOrigin(value) {
  try {
    const url = new URL(value);
    return Boolean(url.protocol && url.host && !url.pathname.replace("/", ""));
  } catch {
    return false;
  }
}

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.env.NODE_ENV !== "production") {
  console.error('NODE_ENV must be "production".');
  process.exit(1);
}

if (placeholders.has(process.env.JWT_SECRET) || process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be a real production secret with at least 32 characters.");
  process.exit(1);
}

if (!process.env.DATABASE_URL.startsWith("postgresql://") && !process.env.DATABASE_URL.startsWith("postgres://")) {
  console.error("DATABASE_URL must be a PostgreSQL connection string.");
  process.exit(1);
}

if (!isOrigin(process.env.FRONTEND_URL)) {
  console.error("FRONTEND_URL must be a valid origin, for example https://nmoo.com.");
  process.exit(1);
}

const invalidCorsOrigins = process.env.CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter((origin) => !isOrigin(origin));

if (invalidCorsOrigins.length > 0) {
  console.error(`Invalid CORS_ORIGINS values: ${invalidCorsOrigins.join(", ")}`);
  process.exit(1);
}

if (process.env.RATE_LIMIT_TTL_SECONDS && Number(process.env.RATE_LIMIT_TTL_SECONDS) <= 0) {
  console.error("RATE_LIMIT_TTL_SECONDS must be greater than 0.");
  process.exit(1);
}

if (process.env.RATE_LIMIT_MAX_REQUESTS && Number(process.env.RATE_LIMIT_MAX_REQUESTS) <= 0) {
  console.error("RATE_LIMIT_MAX_REQUESTS must be greater than 0.");
  process.exit(1);
}

if (process.env.PUBLIC_ASSET_BASE_URL && !isOrigin(process.env.PUBLIC_ASSET_BASE_URL)) {
  console.error("PUBLIC_ASSET_BASE_URL must be a valid origin.");
  process.exit(1);
}

const s3Keys = ["AWS_REGION", "AWS_S3_BUCKET", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"];
const configuredS3Keys = s3Keys.filter((key) => Boolean(process.env[key]));

if (configuredS3Keys.length > 0 && configuredS3Keys.length !== s3Keys.length) {
  console.error(`S3 uploads require all of these variables: ${s3Keys.join(", ")}`);
  process.exit(1);
}

console.log("Production API environment looks ready.");
