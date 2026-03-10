import { type Request, type Response } from "express";
import { env } from "../../env.js";

export type OAuthReceiver = "obsidian" | "session";

export const startOAuth = (req: Request, res: Response) => {
  const clientId = env.GITHUB_CLIENT_ID;

  const receiver: OAuthReceiver =
    (req.query.receiver as OAuthReceiver | undefined) ?? "obsidian";
  const redirect = req.query.redirect as string | undefined;

  const redirectUri = encodeURIComponent(
    `${env.PUBLIC_HOST}/oauth/callback?receiver=${receiver}${redirect ? `&redirect=${redirect}` : ""}`,
  );

  const url =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}`;

  res.redirect(url);
};
