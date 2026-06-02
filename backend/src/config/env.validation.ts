const PLACEHOLDER_JWT_SECRETS = new Set(["replace-with-strong-secret", "change-me", "secret"]);

type Env = Record<string, string | undefined>;

export function validateEnvironment(config: Env) {
  const jwtSecret = config.JWT_SECRET;

  if (!jwtSecret || PLACEHOLDER_JWT_SECRETS.has(jwtSecret) || jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be a non-placeholder value with at least 32 characters.");
  }

  if (!config.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  if (config.FRONTEND_URL && !isValidOrigin(config.FRONTEND_URL)) {
    throw new Error("FRONTEND_URL must be a valid origin URL.");
  }

  if (config.CORS_ORIGINS) {
    config.CORS_ORIGINS.split(",").forEach((origin) => {
      if (!isValidOrigin(origin.trim())) {
        throw new Error("CORS_ORIGINS must contain valid comma-separated origin URLs.");
      }
    });
  }

  if (config.RATE_LIMIT_TTL_SECONDS && Number(config.RATE_LIMIT_TTL_SECONDS) <= 0) {
    throw new Error("RATE_LIMIT_TTL_SECONDS must be greater than 0.");
  }

  if (config.RATE_LIMIT_MAX_REQUESTS && Number(config.RATE_LIMIT_MAX_REQUESTS) <= 0) {
    throw new Error("RATE_LIMIT_MAX_REQUESTS must be greater than 0.");
  }

  if (config.PUBLIC_ASSET_BASE_URL && !isValidUrl(config.PUBLIC_ASSET_BASE_URL)) {
    throw new Error("PUBLIC_ASSET_BASE_URL must be a valid URL.");
  }

  const s3Keys = ["AWS_REGION", "AWS_S3_BUCKET", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"];
  const configuredS3Keys = s3Keys.filter((key) => Boolean(config[key]));

  if (configuredS3Keys.length > 0 && configuredS3Keys.length !== s3Keys.length) {
    throw new Error(`S3 uploads require all of these variables: ${s3Keys.join(", ")}.`);
  }

  return config;
}

function isValidOrigin(value: string) {
  try {
    const url = new URL(value);
    return Boolean(url.protocol && url.host && !url.pathname.replace("/", ""));
  } catch {
    return false;
  }
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return Boolean(url.protocol && url.host);
  } catch {
    return false;
  }
}
