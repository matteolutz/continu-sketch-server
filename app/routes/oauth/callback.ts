import { env } from "~/utils/env.server";
import type { Route } from "./+types/callback";
import axios from "axios";
import jwt from "jsonwebtoken";
import { redirect } from "react-router";
import { prisma } from "~/db.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const reqUrl = new URL(request.url);
  const code = reqUrl.searchParams.get("code");

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

  const contiuSketchUser = await prisma.user.upsert({
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
    { userId: contiuSketchUser.id },
    env.JWT_SECRET,
    {
      expiresIn: "30d",
    },
  );

  const redirectUrl = `obsidian://continu-sketch-auth?token=${pluginToken}&login=${user.login}&name=${user.name}`;

  throw redirect(redirectUrl);
};
