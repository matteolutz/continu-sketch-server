import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  route("/oauth/start", "routes/oauth/start.ts"),
  route("/oauth/callback", "routes/oauth/callback.ts"),
] satisfies RouteConfig;
