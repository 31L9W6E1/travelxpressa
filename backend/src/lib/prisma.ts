import { PrismaClient } from "@prisma/client";

// Railway internal host is only reachable inside Railway.
// In local/dev, prefer DATABASE_PUBLIC_URL when DATABASE_URL points to the internal host.
if (process.env.NODE_ENV !== "production" && process.env.DATABASE_PUBLIC_URL) {
  const databaseUrl = process.env.DATABASE_URL;
  const isInternalRailwayUrl =
    !databaseUrl ||
    databaseUrl.includes("postgres.railway.internal");

  if (isInternalRailwayUrl) {
    process.env.DATABASE_URL = process.env.DATABASE_PUBLIC_URL;
  }
}

export const prisma = new PrismaClient();
