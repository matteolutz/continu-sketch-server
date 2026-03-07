import type { User } from "@prisma-gen/client";
import { createContext } from "react-router";

export const userContext = createContext<User | null>();
