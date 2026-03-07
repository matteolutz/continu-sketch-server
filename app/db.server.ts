import { PrismaClient } from "@prisma-gen/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env["STORAGE_POSTGRES_URL"];

const prismaPg = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter: prismaPg });
