import { type Request, type Response } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import { env } from "../env.js";

export async function oauthCallback(req: Request, res: Response) {
  const code = req.query["code"];

  const tokenRes = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    },
    { headers: { Accept: "application/json" } },
  );

  const accessToken = tokenRes.data.access_token;

  const userRes = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const user = userRes.data;

  const pluginToken = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
    expiresIn: "30d",
  });

  const redirect = `obsidian://continu-sketch-auth?token=${pluginToken}&login=${user.login}&name=${user.name}`;

  res.redirect(redirect);
}
