const { PrismaClient } = require("@prisma/client");

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  const prisma = new PrismaClient();
  const result = await prisma.$queryRaw`SELECT current_database() AS database, current_schema() AS schema, version() AS version`;
  await prisma.$disconnect();

  const info = result[0];
  console.log(`Database: ${info.database}`);
  console.log(`Schema: ${info.schema}`);
  console.log(`Version: ${info.version.split(",")[0]}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
