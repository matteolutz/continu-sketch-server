import { env } from "~/utils/env";
import type { Route } from "./+types/start";
import { redirect } from "react-router";

export const loader = (_: Route.LoaderArgs) => {
  const clientId = env.GITHUB_CLIENT_ID;

  const redirectUri = encodeURIComponent(
    `http://${env.HOST}:${env.PORT}/oauth/callback`,
  );

  const url =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}`;

  throw redirect(url);
};
