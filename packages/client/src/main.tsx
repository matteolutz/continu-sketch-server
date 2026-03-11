import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { UserProvider } from "./context/user";

// disabled strict mode, to prevent double-rendering
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <UserProvider>
    <App />
  </UserProvider>,
);
