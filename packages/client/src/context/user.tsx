import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { type User } from "@prisma/client";

export const UserContext = createContext<User | null>(null);

export const UserProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/web/me", { credentials: "include" })
      .then((res) => res.json())
      .then(({ user }) => setUser(user));
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
