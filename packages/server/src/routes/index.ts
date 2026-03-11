import express from "express";
import { startOAuth } from "./oauth/start.js";
import { oauthCallback } from "./oauth/callback.js";
import { obsidianWs } from "./ws/obsidian.js";
import { authMiddleware, wsAuthMiddleware } from "../middlware/auth.js";
import { createHandoff } from "./api/handoff.js";
import { body } from "express-validator";
import { validationMiddleware } from "../middlware/validation.js";
import expressWs from "express-ws";

import cors from "cors";
import session from "express-session";
import { env } from "../env.js";
import { getMe } from "./web/me.js";
import { logout } from "./web/logout.js";
import { clientWs } from "./ws/client.js";

export const setupDefaultRoutes = (app: expressWs.Instance) => {
  const router = express.Router();
  app.applyTo(router);

  router.use(cors());

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

export const setupWebRoutes = (app: expressWs.Instance) => {
  const router = express.Router();
  app.applyTo(router);

  router.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  );

  router.get("/me", getMe);
  router.post("/logout", logout);

  router.ws("/ws", clientWs);

  return router;
};

export const setupRoutes = (app: expressWs.Instance) => {
  const router = express.Router();
  app.applyTo(router);

  router.use(
    session({
      name: "session",
      secret: env.JWT_SECRET,
      resave: false,
      saveUninitialized: false,

      cookie: {
        httpOnly: true,
        secure: false, // TODO: set this to true
        sameSite: false,
        // 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    }),
  );

  router.use(setupDefaultRoutes(app));
  router.use("/web", setupWebRoutes(app));

  return router;
};
