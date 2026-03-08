import { type Request, type Response } from "express";
import { env } from "../../env.js";

export type OAuthReceiver = "obsidian" | "frontend";

export const startOAuth = (req: Request, res: Response) => {
  const clientId = env.GITHUB_CLIENT_ID;

  const receiver: OAuthReceiver =
    (req.query.receiver as OAuthReceiver | undefined) ?? "obsidian";

  const redirectUri = encodeURIComponent(
    `http://${env.PUBLIC_HOST}/oauth/callback?receiver=${receiver}`,
  );

  const url =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}`;

  res.redirect(url);
};
