import { User } from "@prisma-gen/client.ts";

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}
