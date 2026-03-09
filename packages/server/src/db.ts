import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env["STORAGE_POSTGRES_URL"];

const prismaPg = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter: prismaPg });
