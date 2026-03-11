import { type Request, type Response } from "express";
import { continuSketchError } from "../../error.js";
import { prisma } from "../../db.js";

export const getMe = async (req: Request, res: Response) => {
  if (typeof req.session.userId === "undefined") {
    throw continuSketchError({
      type: "unauthenticated",
      reason: "invalid-session",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.session.userId },
  });

  if (!user) {
    throw continuSketchError({
      type: "unauthenticated",
      reason: "user-not-found",
    });
  }

  res.status(200).json({ user });
};
