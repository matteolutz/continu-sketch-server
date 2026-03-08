import express from "express";
import { startOAuth } from "./oauth/start.js";
import { oauthCallback } from "./oauth/callback.js";

const router = express.Router();

router.get("/oauth/start", startOAuth);
router.get("/oauth/callback", oauthCallback);

export default router;
