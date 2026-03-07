import { getUserFromReq } from "~/utils/user.server";
import type { Route } from "./+types/handoff";

export const action = async ({ request }: Route.ActionArgs) => {
  const user = await getUserFromReq(request);

  return {};
};
