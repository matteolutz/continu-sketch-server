import express from "express";
import { startOAuth } from "./oauth/start.js";
import { oauthCallback } from "./oauth/callback.js";
import { obsidianWs } from "./ws/obsidian.js";
import { authMiddleware, wsAuthMiddleware } from "../middlware/auth.js";
import { createHandoff } from "./api/handoff.js";
import { body } from "express-validator";
import { validationMiddleware } from "../middlware/validation.js";
import expressWs from "express-ws";

export const setupRoutes = (app: expressWs.Instance) => {
  const router = express.Router();
  app.applyTo(router);

  router.get("/oauth/start", startOAuth);
  router.get("/oauth/callback", oauthCallback);

  router.post(
    "/api/handoff",
    authMiddleware,
    body("fileName").isString().trim().notEmpty(),
    body("fileType").isString().trim().notEmpty(),
    validationMiddleware,
    createHandoff,
  );

  router.ws("/ws/obsidian", wsAuthMiddleware, obsidianWs);

  return router;
};
