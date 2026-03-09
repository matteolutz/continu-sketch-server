import { Request, Response } from "express";
import { prisma } from "../../db.js";

export const createHandoff = async (req: Request, res: Response) => {
  const user = req.user!; // will be set by authMiddleware
  const { fileName, fileType } = req.body;

  const handoff = await prisma.handoff.create({
    data: {
      fileName,
      fileType,

      user: {
        connect: { id: user.id },
      },
    },
  });

  res.status(200).json({ handoffId: handoff.id });
};
