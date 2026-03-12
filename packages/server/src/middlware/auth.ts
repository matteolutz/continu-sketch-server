import { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env.js";
import { prisma } from "../db.js";
import * as ws from "ws";
import { continuSketchError } from "../error.js";

export const getUserFromToken = async (token: string) => {
  const jwtResult = jwt.verify(token, env.JWT_SECRET);

  if (typeof jwtResult === "string") {
    throw continuSketchError({
      type: "unauthenticated",
      reason: "invalid-jwt",
    });
  }

  if (!("userId" in jwtResult)) {
    throw continuSketchError({
      type: "unauthenticated",
      reason: "invalid-jwt",
    });
  }

  const userId = jwtResult.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user === null) {
    throw continuSketchError({
      type: "unauthenticated",
      reason: "user-not-found",
    });
  }

  return user;
};

export const getUserFromReq = async (request: Request) => {
  const authHeader = request.header("authorization");

  if (typeof authHeader === "undefined") {
    throw continuSketchError({
      type: "unauthenticated",
      reason: "invalid-authorization-header",
    });
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer") {
    throw continuSketchError({
      type: "unauthenticated",
      reason: "invalid-authorization-header",
    });
  }

  return await getUserFromToken(token);
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await getUserFromReq(req);

  req.user = user;
  next();
};

export const wsAuthMiddleware = async (
  ws: ws.WebSocket,
  req: Request,
  next: NextFunction,
) => {
  try {
    const token = req.query["token"] as string | undefined;
    if (typeof token === "undefined") {
      throw continuSketchError({
        type: "unauthenticated",
        reason: "invalid-jwt",
      });
    }

    req.user = await getUserFromToken(token);
  } catch (err) {
    ws.close(3000, "Unauthorized"); // 3000 = HTTP 401
    return;
  }

  next();
};
