import { type Request, type Response } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import { env } from "../../env.js";
import { prisma } from "../../db.js";
import { OAuthReceiver } from "./start.js";

export const oauthCallback = async (req: Request, res: Response) => {
  const code = req.query["code"];
  const receiver = req.query["receiver"] as OAuthReceiver;

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

  const continuSketchUser = await prisma.user.upsert({
    where: {
      githubId: user.id,
    },
    update: {
      name: user.name,
      githubLogin: user.login,
    },
    create: {
      name: user.name,
      githubLogin: user.login,
      githubId: user.id,
    },
  });

  const pluginToken = jwt.sign(
    { userId: continuSketchUser.id },
    env.JWT_SECRET,
    {
      expiresIn: "30d",
    },
  );

  switch (receiver) {
    case "frontend":
      // TODO:
      break;
    case "obsidian":
      const obsidianRedirect = `obsidian://continu-sketch-auth?token=${pluginToken}&login=${user.login}&name=${user.name}`;
      res.redirect(obsidianRedirect);
      break;
  }
};
