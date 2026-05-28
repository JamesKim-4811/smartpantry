import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const adapter = new PrismaBetterSqlite3({
  url: `file:${path.resolve(__dirname, "../prisma/smartpantry.db")}`,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
