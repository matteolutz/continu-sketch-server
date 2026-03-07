import jwt from "jsonwebtoken";
import { env } from "./env.server";
import { prisma } from "~/db.server";

export class InvalidJwtTokenError extends Error {
  constructor() {
    super("Invalid JWT");
  }
}

export const getUserFromToken = async (token: string) => {
  const jwtResult = jwt.verify(token, env.JWT_SECRET);

  if (typeof jwtResult === "string") {
    throw new InvalidJwtTokenError();
  }

  if (!("userId" in jwtResult)) {
    throw new InvalidJwtTokenError();
  }

  const userId = jwtResult.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user === null) {
    throw new Error("User not found");
  }

  return user;
};

export const getUserFromReq = async (request: Request) => {
  const authHeader = request.headers.get("Authorization");

  if (authHeader === null) {
    throw new Error("Authorization header not found");
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer") {
    throw new Error("Invalid authorization type");
  }

  return await getUserFromToken(token);
};
