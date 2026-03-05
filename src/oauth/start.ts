import { type Request, type Response } from "express";
import { env } from "../env.js";

export const startOAuth = (_req: Request, res: Response) => {
  const clientId = env.GITHUB_CLIENT_ID;

  const redirectUri = encodeURIComponent(
    "http://127.0.0.1:3000/oauth/callback",
  );

  const url =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}`;

  res.redirect(url);
};
