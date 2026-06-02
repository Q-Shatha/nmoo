import { validateEnvironment } from "./env.validation";

describe("validateEnvironment", () => {
  it("rejects placeholder JWT secrets", () => {
    expect(() =>
      validateEnvironment({
        DATABASE_URL: "postgresql://postgres:password@localhost:5432/nmoo_db",
        JWT_SECRET: "replace-with-strong-secret",
        FRONTEND_URL: "http://localhost:3000",
      }),
    ).toThrow("JWT_SECRET");
  });

  it("accepts a strong local configuration", () => {
    const config = validateEnvironment({
      DATABASE_URL: "postgresql://postgres:password@localhost:5432/nmoo_db",
      JWT_SECRET: "a-local-test-secret-with-more-than-32-characters",
      FRONTEND_URL: "http://localhost:3000",
      CORS_ORIGINS: "http://localhost:3000,http://localhost:3001",
    });

    expect(config.JWT_SECRET).toContain("local-test-secret");
  });
});
