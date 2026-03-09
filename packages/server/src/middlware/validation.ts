import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { continuSketchError } from "../error.js";

export const validationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  throw continuSketchError({
    type: "validation-error",
    errors: result.array().map((e) => e.msg),
  });
};
