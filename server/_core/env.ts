export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  databaseUrl: process.env.DATABASE_URL ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin",
  isProduction: process.env.NODE_ENV === "production",
};